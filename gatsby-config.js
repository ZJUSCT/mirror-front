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
    'gatsby-plugin-postcss',
    'gatsby-plugin-mdx',
    'gatsby-plugin-layout',
  ],
  developMiddleware: app => {
    app.use(
      '/api',
      createProxyMiddleware({
        router: {
          '/': 'http://mirrorhost',
        },
        onProxyReq: (proxyRes, req, res) => {
          proxyRes.setHeader('host', 'newmirrors.zju.edu.cn');
          // console.log(proxyRes)
        },
      }),
    );
  }
}
