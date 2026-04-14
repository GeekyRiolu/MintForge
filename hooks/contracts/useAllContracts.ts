import {
  Dai,
  Genesis_key,
  Genesis_key_distributor,
  Genesis_key_team_claim,
  Genesis_key_team_distributor,
  Marketplace,
  MaxProfiles,
  Nft_aggregator,
  Nft_profile,
  Nft_resolver,
  Nft_token,
  Profile_auction,
  Usdc,
  Weth } from 'constants/typechain';
import { getDaiContract } from 'hooks/contracts/getDaiContract';
import { getGenesisKeyContract } from 'hooks/contracts/getGenesisKeyContract';
import { getNftProfileContract } from 'hooks/contracts/getNftProfileContract';
import { getNftTokenContract } from 'hooks/contracts/getNftTokenContract';
import { getProfileAuctionContract } from 'hooks/contracts/getProfileAuctionContract';
import { getUsdcContract } from 'hooks/contracts/getUsdcContract';
import { getWethContract } from 'hooks/contracts/getWethContract';
import { Doppler, getEnv } from 'utils/env';
import { getAddress } from 'utils/httpHooks';

import { getGenesisKeyDistributorContract } from './getGenesisKeyDistributorContract';
import { getGenesisKeyTeamClaimContract } from './getGenesisKeyTeamClaimContract';
import { getGenesisKeyTeamDistributorContract } from './getGenesisKeyTeamDistributorContract';
import { getMarketplaceContract } from './getMarketplaceContract';
import { getMaxProfilesContract } from './getMaxProfilesContract';
import { getNftAggregatorContract } from './getNftAggregatorContract';
import { getNftResolverContract } from './getNftResolverContract';

import { useEffect, useState } from 'react';
import { useNetwork, useProvider, useSigner } from 'wagmi';

export interface Contracts {
  dai: Dai;
  weth: Weth;
  usdc: Usdc;
  nftToken: Nft_token;
  nftProfile: Nft_profile;
  nftResolver: Nft_resolver;
  maxProfiles: MaxProfiles;
  profileAuction: Profile_auction;
  genesisKey: Genesis_key;
  genesisKeyDistributor: Genesis_key_distributor;
  genesisKeyTeamDistributor: Genesis_key_team_distributor;
  genesisKeyTeamClaim: Genesis_key_team_claim;
  aggregator: Nft_aggregator;
  marketplace: Marketplace;
}

export function useAllContracts(): Contracts {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();

  const chainId = chain?.id ?? getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID);
  
  const provider = useProvider({ chainId: Number(chainId) });

  const [daiContract, setDaiContract] =
    useState(getDaiContract(getAddress('dai', chainId), provider));
  const [wethContract, setWethContract] =
    useState(getWethContract(getAddress('weth', chainId), provider));
  const [usdcContract, setUsdcContract] =
    useState(getUsdcContract(getAddress('usdc', chainId), provider));
  const [nftTokenContract, setNftTokenContract] =
    useState(getNftTokenContract(getAddress('nft', chainId), provider));
  const [nftProfileContract, setNftProfileContract] =
    useState(getNftProfileContract(getAddress('nftProfile', chainId), provider, signer));
  useState(getNftProfileContract(getAddress('nftProfile', chainId), provider));
  const [maxProfilesContract, setMaxProfilesContract] = useState(
    getMaxProfilesContract(getAddress('maxProfiles', chainId), provider)
  );
  const [profileAuctionContract, setProfileAuctionContract] = useState(
    getProfileAuctionContract(getAddress('profileAuction', chainId), provider));
  const [genesisKeyContract, setGenesisKeyContract] =
    useState(getGenesisKeyContract(getAddress('genesisKey', chainId), provider));
  const [genesisKeyDistributorContract, setGenesisKeyDistributorContract] = useState(
    getGenesisKeyDistributorContract(getAddress('genesisKeyDistributor', chainId), provider)
  );
  const [genesisKeyTeamDistributorContract, setGenesisKeyTeamDistributorContract] = useState(
    getGenesisKeyTeamDistributorContract(
      getAddress('genesisKeyTeamDistributor', chainId),
      provider
    )
  );
  const [genesisKeyTeamClaim, setGenesisKeyTeamClaim] = useState(
    getGenesisKeyTeamClaimContract(getAddress('genesisKeyTeamClaim', chainId), provider)
  );
  const [nftResolverContract, setNftResolverContract] = useState(
    getNftResolverContract(getAddress('nftResolver', chainId), signer, provider)
  );
  const [aggregator, setAggregator] = useState<Nft_aggregator>(
    getNftAggregatorContract(getAddress('aggregator', chainId), signer ?? provider)
  );
  const [marketPlaceContract, setMarketPlaceContract] =
    useState(getMarketplaceContract(getAddress('marketplace', chainId), provider));

  useEffect(() => {
    setDaiContract(getDaiContract(getAddress('dai', chainId), provider));
    setWethContract(getWethContract(getAddress('weth', chainId), provider));
    setUsdcContract(getUsdcContract(getAddress('usdc', chainId), provider));
    setNftTokenContract(getNftTokenContract(getAddress('nft', chainId), provider));
    setNftProfileContract(getNftProfileContract(getAddress('nftProfile', chainId), provider, signer));
    setMaxProfilesContract(getMaxProfilesContract(getAddress('maxProfiles', chainId), provider));
    setProfileAuctionContract(getProfileAuctionContract(getAddress('profileAuction', chainId), provider));
    setGenesisKeyContract(getGenesisKeyContract(getAddress('genesisKey', chainId), provider));
    setGenesisKeyDistributorContract(
      getGenesisKeyDistributorContract(getAddress('genesisKeyDistributor', chainId), provider)
    );
    setGenesisKeyTeamDistributorContract(
      getGenesisKeyTeamDistributorContract(
        getAddress('genesisKeyTeamDistributor', chainId),
        provider
      )
    );
    setGenesisKeyTeamClaim(
      getGenesisKeyTeamClaimContract(getAddress('genesisKeyTeamClaim', chainId), provider)
    );
    setNftResolverContract(
      getNftResolverContract(getAddress('nftResolver', chainId), signer, provider)
    );
    setAggregator(getNftAggregatorContract(getAddress('aggregator', chainId), signer ?? provider));
    setMarketPlaceContract(
      getMarketplaceContract(getAddress('marketplace', chainId), provider)
    );
  }, [chainId, provider, signer]);
  
  return {
    dai: daiContract,
    weth: wethContract,
    usdc: usdcContract,
    nftToken: nftTokenContract,
    nftProfile: nftProfileContract,
    nftResolver: nftResolverContract,
    maxProfiles: maxProfilesContract,
    profileAuction: profileAuctionContract,
    genesisKey: genesisKeyContract,
    genesisKeyDistributor: genesisKeyDistributorContract,
    genesisKeyTeamDistributor: genesisKeyTeamDistributorContract,
    genesisKeyTeamClaim: genesisKeyTeamClaim,
    aggregator,
    marketplace: marketPlaceContract
  };
}
