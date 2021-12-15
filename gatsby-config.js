/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/gatsby-config/
 */

module.exports = {
  /* Your site config here */
  plugins: [
    'gatsby-plugin-postcss',
    `gatsby-plugin-mdx`,
  ],
  proxy: {
    prefix: "/Mirrors",
    url: "http://127.0.0.1:2345",
  },
}
