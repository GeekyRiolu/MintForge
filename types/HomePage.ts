
export type HomePageV3Hero = {
  dynamicUrls: string[];
  heroTextData: {
    title: string,
    titleDrop: {
      firstPhrase: string,
      secondPhrase: string,
      thirdPhrase: string,
    }
    subTitle: string,
    ctaButton: string,
    ctaLink: string,
  },
  heroImagesCollection: {
    items: Array<{url: string}>;
  },
}
export type HomePageV3WhatWeCanDo = {
  whatWeCanDoTitle: {
    fullTitle?: string,
    gradientTitle?: {
      blackWord: string,
      orangeWord: string
    }
  },
  whatWeCanDoImage: {
    url: string,
  },
  whatWeCanDoBg?: {
    url: string,
  },
}
export type HomePageV3SectionDynamicLinks = {
  sectionDynamicLinks: string[];
}
export type HomePageV3SocialSection = {
  items: Array<{
    titleArray?: Array<{text?: string, isOrange?: boolean}>
    leftImage?: boolean;
    subTitle?: string;
    buttonText?: string;
    buttonLink?: string;
    image?: {
      url: string
    }
  }>
}
export type HomePageV3BuildProfileSection = {
  title: string,
  subTitle: string,
  ctaButton: string,
  ctaLink: string
}
export type HomePageV3BlogSection = {
  items: Array<{
    slug: string;
    title: string;
    author: {
      name: string;
      image: {
        url: string;
      };
    }
    heroImage: {
      url: string;
    };
  }>
}
export type HomePageV3CollectionsSection = {
  collectionsAddressIds: Array<''>;
  ctaButtonLink: string;
  ctaButtonText: string;
  sectionTitle: string;
}
export type HomePageV3 = {
  dynamicUrls: string[];
  heroTextData?: {
    title: string,
    titleDrop: {
      firstPhrase: string,
      secondPhrase: string,
      thirdPhrase: string,
    }
    subTitle: string,
    ctaButton: string,
    ctaLink: string,
  },
  heroImagesCollection: {
    items: Array<{url: string}>;
  },
  whatWeCanDoTitle: {
    fullTitle: string,
    gradientTitle?: {
      blackWord: string,
      orangeWord: string
    }
  },
  whatWeCanDoImage: {
    url: string,
  },
  whatWeCanDoBg?: {
    url: string,
  },
  sectionDynamicLinks: string[],
  textAndImageCollection?: HomePageV3SocialSection;
  buildProfileSection?: HomePageV3BuildProfileSection;
  blogSectionTitle: {
    title: string,
    subTitle: string,
  }
  goToBlogButton: {
    title: string,
    link: string,
  }
  blogCollection: HomePageV3BlogSection;
  collectionsSection: HomePageV3CollectionsSection;
}
export type HomePageV2 = {
  plants: string
  dynamicUrl: any
  heroCta: {
    link: string,
    title: string,
  }
  wycdBlock1Title: string[]
  wycdBlock1Description: string;
  wycdBlock1Cta: {
    link: string,
    title: string,
  }
  wycdBlock2Title: string;
  wycdBlock2Description: string;
  wycdNfTs: string;
  discoverDescription: string;
  discoverImage: {
    url: string,
    description: string,
  }
  hiwTitle: string;
  hiwSubtitle: string;
  hiwBlock1Title: string;
  hiwBlock1Description: string;
  hiwBlock1Image: {
    url: string,
    description: string,
  }
  hiwBlock2Title: string;
  hiwBlock2Description: string;
  hiwBlock2Image: {
    url: string,
    description: string,
  }
  hiwBlock3Title: string;
  hiwBlock3Description: string;
  hiwBlock3Image: {
    url: string,
    description: string,
  }
  newsTitle: string;
  newsSubtitle: string;
  newsSlidesCollection: any;
  newsCta: {
    link: string,
    title: string,
  }
  tags: {
    tags1: string[],
    tags2: string[]
  };
  bynpCta: {
    link: string,
    title: string,
  }
  wycdBlock2Row1NftsCollection: any,
  wycdBlock2Row2NftsCollection: any,
  heroNfTsCollection: any,
  wycdTitleNfTs: {
    url: string,
  },
  discoverTitleNfTs: {
    url: string,
  },
  bynpTitleNfTsCollection: any
  leaderboardTitle: string
}

export type HomePageProps = {
  data: HomePageV2[]
};
