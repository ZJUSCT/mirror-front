/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/gatsby-config/
 */
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = {
  /* Your site config here */
  assetPrefix: `/assets`,
  plugins: [
    'gatsby-plugin-sass',
    {
      resolve: 'gatsby-plugin-mdx',
      options: {
        defaultLayouts: {
          default: require.resolve('./src/layouts/doc.tsx')
        }
      }
    },
    {
      resolve: "gatsby-plugin-react-svg",
      options: {
        rule: {
          include: /icons/
        }
      }
    },
    'gatsby-plugin-layout',
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
          // console.log(proxyRes)
        },
      }),
    );
  }
}
