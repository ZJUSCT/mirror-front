/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/gatsby-config/
 */

module.exports = {
  /* Your site config here */
  pathPrefix: `/new-site`,
  plugins: [
    'gatsby-plugin-postcss',
    'gatsby-plugin-mdx',
    'gatsby-plugin-layout',
  ],
  proxy: {
    prefix: "/mirrors",
    url: "http://127.0.0.1:2345",
  },
}
