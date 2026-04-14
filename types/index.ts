export * from './alchemy';
export * from './balanceData';
export * from './blogs';
export * from './marketplaces';
export * from './seaport';
export * from './search';
export * from './X2Y2';

export type TickerStat = {
  stat: {
    value: string;
    sub: string;
  }
};

export type UserNotifications = {
  hasUnclaimedProfiles: boolean;
  hasPendingAssociatedProfiles: boolean;
  profileNeedsCustomization: boolean;
  associatedProfileAdded: boolean;
  associatedProfileRemoved: boolean;
  hasSoldActivity: boolean;
  hasPurchasedActivity: boolean;
  hasExpiredListings: boolean;
  profileExpiration: boolean;
  nftPurchase: boolean;
};

export type ValidTimeFrame = '1D' | '7D' | '1M' | '3M' | '1Y' | 'ALL';

export type CuratedCollection = {
  tabTitle: string;
  contractAddresses: string[]
}

export type ResultsPageProps = {
  data: CuratedCollection[]
};

export type DiscoverPageProps = {
  data: CuratedCollection[]
  dataDev: CuratedCollection[]
};

export type SitemapField = {
  loc: string,
  lastmod: string,
  priority: 0.7,
  changefreq: 'monthly' | 'daily' | 'hourly'
}

export type SitemapQueryVariables = {
  chainId: string
  contract: string,
  slug: string,
  document: string,
  variables: Record<string, any>,
}
