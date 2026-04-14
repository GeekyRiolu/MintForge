/** @type {import('next-sitemap').IConfig} */
const siteUrl = process.env.NEXT_PUBLIC_BASE_URL;

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  sitemapSize: 5000, // Will support 250M urls 50K files w/5K urls
  changefreq: 'daily', // Default
  exclude: ['/server-sitemap-index.xml'],
  robotsTxtOptions: {
    additionalSitemaps: [
      `${siteUrl}server-sitemap-index.xml`,
    ],
    policies: [
      {
        userAgent: '*',
        disallow: ['/*'],
        allow: [
          '/$',
          '/app/collection/official/*',
          '/app/discover',
          '/app/discover/*',
          '/articles',
          '/articles/*',
          '/*.xml',
        ],
      }
    ]
  },
};
