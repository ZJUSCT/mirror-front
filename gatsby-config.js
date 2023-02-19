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
  assetPrefix: config.assetPrefix,
  pathPrefix: config.pathPrefix,
  plugins: [
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
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'news',
        path: `${__dirname}/news`,
      }
    },
    {
      resolve: "gatsby-plugin-mdx",
      options: {
        mdxOptions: {
          remarkPlugins: [
            // Add GitHub Flavored Markdown (GFM) support
            // Warning: Most of the remark ecosystem is ESM which means that packages 
            // like remark-gfm don’t work out of the box with Gatsby v5. To make remark-gfm
            // compatible with the current Gatsby version, we have to use an old version of
            // remark-gfm. Please take care in future updates.
            require(`remark-gfm`),
          ],
        },
      }
    },
    {
      resolve: "gatsby-plugin-react-svg",
      options: {
        rule: {
          include: /icons/,
          omitKeys: [
            'inkscapePageshadow', 'inkscapePageopacity', 'inkscapePagecheckerboard', 
            'inkscapeZoom', 'inkscapeCx', 'inkscapeCy', 'inkscapeWindowWidth', 'inkscapeWindowHeight', 
            'inkscapeWindowX', 'inkscapeWindowY', 'inkscapeWindowMaximized', 'inkscapeCurrentLayer', 
            'sodipodiNodetypes', 'sodipodiDocname', 'inkscapeVersion', 'xmlnsInkscape', 'xmlnsSodipodi',
            'xmlnsSvg', 
          ]
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
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        icon: 'resource/icons/favicon.svg',
      },
    },

    `gatsby-plugin-preact`,
    `gatsby-plugin-sass`
  ],
  developMiddleware: app => {
    app.use(
      '/api',
      createProxyMiddleware({
        target: 'http://mirrors.zju.edu.cn',
        onProxyReq: (proxyRes, req, res) => {
          proxyRes.setHeader('host', 'mirrors.zju.edu.cn');
        },
      }),
    );
  }
}
