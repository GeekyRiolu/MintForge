import { StagedListing } from 'components/modules/Checkout/NFTListingsContext';
import { StagedPurchase } from 'components/modules/Checkout/NFTPurchaseContext';
import { LooksrareProtocolData, SeaportProtocolData, X2Y2ProtocolData } from 'graphql/generated/types';
import { useAllContracts } from 'hooks/contracts/useAllContracts';
import { ExternalProtocol } from 'types';
import { Doppler, getEnv } from 'utils/env';
import { isNullOrEmpty } from 'utils/format';

import { BigNumber as BN } from 'bignumber.js';
import { BigNumber } from 'ethers';
import useSWR, { mutate } from 'swr';
import { PartialDeep } from 'type-fest';
import { useNetwork } from 'wagmi';

interface RoyaltyObject {
  [key: string]: number;
}

interface MinMaxRoyalty {
  min: number;
  max: number;
  royalty?: RoyaltyObject;
}
export interface CreatorFeeDetails {
  data: MinMaxRoyalty
  loading: boolean;
  mutate: () => void;
}

export interface CalculatedCreatorFeeDeatils {
  royalty: number;
  marketplace: ExternalProtocol;
}

const getCreatorFeeFromListing = (
  looksrareProtocolFeeBps: BigNumber,
  itemParam: PartialDeep<StagedListing | StagedPurchase>,
  buy: boolean
): CalculatedCreatorFeeDeatils => {
  if (buy) {
    const item = itemParam as StagedPurchase;
    if (item.protocol === ExternalProtocol.LooksRare) {
      const protocolData = item?.protocolData as LooksrareProtocolData;
      const minAskAmount = BigNumber.from(protocolData?.minPercentageToAsk ?? 0)
        .mul(BigNumber.from(protocolData?.price ?? 0))
        .div(10000);
      const marketplaceFeeAmount = BigNumber.from(looksrareProtocolFeeBps ?? 0)
        .mul(BigNumber.from(protocolData?.price ?? 0))
        .div(10000);
      const royalty = minAskAmount.sub(marketplaceFeeAmount);
      return { royalty: Number(new BN(royalty.toHexString()).shiftedBy(-18)), marketplace: item.protocol };
    } else if (item.protocol === ExternalProtocol.Seaport) {
      const protocolData = item?.protocolData as SeaportProtocolData;
      const royalty = BigNumber.from(protocolData?.parameters?.consideration.length === 3 ?
        protocolData?.parameters?.consideration[2].startAmount :
        0);
      return { royalty: Number(new BN(royalty.toHexString()).shiftedBy(-18)), marketplace: item.protocol };
    } else if (item.protocol === ExternalProtocol.X2Y2) {
      const protocolData = item?.protocolData as X2Y2ProtocolData;
      const royalty = BigNumber.from(protocolData?.royalty_fee);
      return { royalty: Number(new BN(royalty.toHexString()).shiftedBy(-18)), marketplace: item.protocol };
    } else if (item.protocol === ExternalProtocol.NFTCOM) {
      return { royalty: 0, marketplace: item.protocol };
    }
  } else {
    const item = itemParam as StagedListing;
    return { royalty: 0, marketplace: item?.targets[0]?.protocol };
  }
};

export function useGetCreatorFee(
  contractAddress: string,
  tokenId: string,
  looksrareProtocolFeeBps: BigNumber,
  item: PartialDeep<StagedListing | StagedPurchase>,
  buy: boolean,
): CreatorFeeDetails {
  const { chain } = useNetwork();
  const { marketplace } = useAllContracts();

  const keyString = 'GetCreatorFee ' + String(chain?.id || getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID)) + contractAddress + tokenId;

  const { data: NFTCOMRoyaltyFee } = useSWR(
    'NFTCOMRoyaltyFee' + contractAddress?.toLowerCase(),
    async () => {
      return await marketplace.royaltyInfo(contractAddress?.toLowerCase());
    },
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    });

  const calculatedFee = getCreatorFeeFromListing(
    looksrareProtocolFeeBps,
    item,
    buy,
  );

  const { data } = useSWR(keyString, async () => {
    if (chain?.id !== 1 && getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID) !== '1') {
      return null;
    }
    if (isNullOrEmpty(contractAddress) || tokenId == null) {
      return null;
    }

    const looksrare = 'https://api.thegraph.com/subgraphs/name/looksrare/royalty-fee-registry';
    const seaport = 'https://api.thegraph.com/subgraphs/name/messari/opensea-seaport-ethereum';
    const x2y2 = 'https://api.thegraph.com/subgraphs/name/messari/x2y2-ethereum';
    const query = `{\n  collections(where: { id: "${contractAddress?.toLowerCase()}" }) {\n    id\n    royaltyFee\n  }\n}`;
    // post request using fetch
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    };

    const royalty: RoyaltyObject = {};
    const responseLR = await fetch(looksrare, requestOptions);
    const responseSeaport = await fetch(seaport, requestOptions);
    const responseX2Y2 = await fetch(x2y2, requestOptions);
    const dataLR = await responseLR.json();
    const dataSeaport = await responseSeaport.json();
    const dataX2Y2 = await responseX2Y2.json();

    royalty['looksrare'] = (dataLR?.data?.collections[0]?.royaltyFee) || 0;
    royalty['seaport'] = (dataSeaport?.data?.collections[0]?.royaltyFee) || 0;
    royalty['x2y2'] = (dataX2Y2?.data?.collections[0]?.royaltyFee) || 0;
    royalty['nftcom'] = (Number(NFTCOMRoyaltyFee ? NFTCOMRoyaltyFee[1] : 0) / 100) || 0; // divide 100 to get percent (10000 = 100%)

    switch (calculatedFee.marketplace) {
    case ExternalProtocol.LooksRare:
      royalty['looksrare'] = royalty['looksrare'] || calculatedFee.royalty;
      break;
    case ExternalProtocol.Seaport:
      royalty['seaport'] = royalty['seaport'] || calculatedFee.royalty;
      break;
    case ExternalProtocol.X2Y2:
      royalty['x2y2'] = royalty['x2y2'] || calculatedFee.royalty;
      break;
    case ExternalProtocol.NFTCOM:
      royalty['nftcom'] = royalty['nftcom'] || calculatedFee.royalty;
      break;
    }

    // if royalty is empty return 0
    if (Object.keys(royalty).length === 0) {
      return { min: 0, max: 0 };
    }

    // get min and max royalty
    const min = Math.min(...Object.values(royalty));
    const max = Math.max(...Object.values(royalty));

    return { min, max, royalty };
  });

  return {
    data: data,
    loading: data == null,
    mutate: () => {
      mutate(keyString);
    },
  };
}
