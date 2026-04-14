export type AuthorData = {
  name: string;
  title: string;
  company: string;
  shortBio: string;
  email: string;
  phone: string;
  facebook: string;
  twitter: string;
  github: string;
  image: {
    url: string;
    description: string;
  };
};

export type PostData = {
  title: string;
  slug: string;
  heroImage: {
    url: string;
    description: string;
  };
  description: string;
  body: string;
  author: AuthorData;
  publishDate: string;
  tags: string[];
  relatedPostsCollection: {
    items: PostData[];
  };
  sys: {
    id: string
  }
};
