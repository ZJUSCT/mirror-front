/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/gatsby-config/
 */
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = {
  /* Your site config here */
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
    'gatsby-plugin-mdx',
    {
      resolve: "gatsby-plugin-react-svg",
      options: {
        rule: {
          include: /icons/
        }
      }
    }
  ],
  developMiddleware: app => {
    app.use(
      '/api',
      createProxyMiddleware({
        router: {
          '/': 'http://mirrors.zju.edu.cn/api/',
        },
        onProxyReq: (proxyRes, req, res) => {
          proxyRes.setHeader('host', 'newmirrors.zju.edu.cn');
        },
      }),
    );
  }
}
