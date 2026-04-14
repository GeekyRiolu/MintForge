import { get721Contract } from 'hooks/contracts/get721Contract';

import { useCallback } from 'react';
import useSWR from 'swr';
import { useAccount, useNetwork, useProvider, useSigner } from 'wagmi';

export enum TransferProxyTarget {
  LooksRare = '0xf42aa99F011A1fA7CDA90E5E98b277E306BcA83e',
  LooksRare1155 = '0xFED24eC7E22f573c2e08AEF55aA6797Ca2b3A051',
  Opensea = '0x1e0049783f008a0085193e00003d00cd54003c71',
  X2Y2 = '0xF849de01B080aDC3A814FaBE1E2087475cF2E354',
  X2Y21155 = '0x024aC22ACdB367a3ae52A3D94aC6649fdc1f0779',
  NFTCOM = '0x7AFAF0D3dd4aC87D21C326A7e07D0345f6071DAD'
}

export function useNftCollectionAllowance(
  collectionAddress: string,
  currentAddress: string,
  target: TransferProxyTarget
): {
    allowedAll: boolean,
    mutate: () => void ,
    requestAllowance: () => Promise<void>
  } {
  const { connector } = useAccount();
  const { data: signer } = useSigner();
  const { chain } = useNetwork();
  const provider = useProvider({ chainId: chain?.id });
  const collection = get721Contract(collectionAddress, provider);

  const keyString = `${chain?.id}_${collectionAddress}_allowance_${currentAddress}_${target}`;

  const { data, mutate } = useSWR(keyString, async () => {
    if (collection == null) {
      return false;
    }
    try {
      const allowed = await collection.isApprovedForAll(currentAddress, target).catch(() => false);
      return allowed ?? false;
    } catch (e) {
      console.log(
        'Failed to call isApprovedForAll on NFT collection contract. ',
        collectionAddress,
        e
      );
      return false;
    }
  });

  const requestAllowance = useCallback(async () => {
    if (connector == null || target == null || signer == null) {
      console.log('Failed to set approvals, please connect wallet');
      return;
    }
    const tx = await collection
      .connect(signer)
      .setApprovalForAll(target, true);
    await tx.wait(1).then(() => {
      mutate();
    });
  }, [connector, target, signer, collection, mutate]);

  return {
    allowedAll: data ?? false,
    requestAllowance,
    mutate,
  };
}
