/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/gatsby-config/
 */
const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('./config');

module.exports = {
  siteMetadata: {
    title: 'ZJU Mirror',
    description: 'ZJU Mirror is a non-profit program aimed at popularizing open source software and facilitating efficient access to various resources of open source projects by all users.',
    author: 'ZJU SCT',
  },
  pathPrefix: `/index`,
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-theme-material-ui`,
      options: {
        webFontsConfig: {
          fonts: {
            google: [
              {
                family: `Metrophobic`
              },
            ],
          },
        },
      }
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'mirrors',
        path: `${__dirname}/docs`,
      }
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'locales',
        path: `${__dirname}/locales`,
      }
    },
    'gatsby-plugin-mdx',
    {
      resolve: "gatsby-plugin-react-svg",
      options: {
        rule: {
          include: /icons/
        }
      }
    },
    {
      resolve: `gatsby-plugin-react-i18next`,
      options: {
        localeJsonSourceName: 'locales', // name given to `gatsby-source-filesystem` plugin.
        languages: config.locales,
        defaultLanguage: config.defaultLanguage,
        redirect: false,
        // if you are using Helmet, you must include siteUrl, and make sure you add http:https
        siteUrl: config.siteUrl,
        // you can pass any i18next options
        // pass following options to allow message content as a key
        i18nextOptions: {
          interpolation: {
            escapeValue: false // not needed for react as it escapes by default
          },
          keySeparator: false,
          nsSeparator: false
        },
        pages: Object.values(config.documentSources).map(
          s => ({
            matchPath: s.path,
            getLanguageFromPath: s.getLanguageFromPath,
          })
        )
      }
    },
  ],
  developMiddleware: app => {
    app.use(
      '/api',
      createProxyMiddleware({
        target: 'http://mirror.zju.edu.cn',
        onProxyReq: (proxyRes, req, res) => {
          proxyRes.setHeader('host', 'mirror.zju.edu.cn');
        },
      }),
    );
  }
}
