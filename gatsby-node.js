const { match, compile } = require("path-to-regexp");
const { createFilePath } = require(`gatsby-source-filesystem`)
const { createContentDigest } = require(`gatsby-core-utils`)
const config = require('./config');

const mdxResolverPassthrough = (fieldName) => async (
  source,
  args,
  context,
  info
) => {
  const type = info.schema.getType(`Mdx`);
  const mdxNode = context.nodeModel.getNodeById({
    id: source.parent,
  });
  const resolver = type.getFields()[fieldName].resolve;
  const result = await resolver(mdxNode, args, context, info);
  return result;
}

exports.createSchemaCustomization = ({ actions, schema }) => {
  const { createTypes } = actions;

  // interface for all kinds of documents
  createTypes(`interface Document implements Node {
      id: ID!
      title: String
      source: String!
      body: String!
      html: String!
      slug: String!
      date: Date @dateformat
      tags: [String]!
      tableOfContents: JSON
      frontmatter: JSON
      locale: String!
  }`);

  // MDX document implements Document interface
  createTypes(
    schema.buildObjectType({
      name: `MdxDocument`,
      fields: {
        id: { type: `ID!` },
        title: {
          type: `String`,
        },
        source: {
          type: `String!`,
        },
        slug: {
          type: `String!`,
        },
        date: { type: `Date`, extensions: { dateformat: {} } },
        tags: { type: `[String]!` },
        tableOfContents: {
          type: `JSON`,
          resolve: mdxResolverPassthrough(`tableOfContents`),
        },
        body: {
          type: `String!`,
          resolve: mdxResolverPassthrough(`body`),
        },
        html: {
          type: `String!`,
          resolve: mdxResolverPassthrough(`html`),
        },
        frontmatter: {
          type: `JSON`,
          resolve: mdxResolverPassthrough(`frontmatter`),
        },
        locale: {
          type: `String!`,
        },
      },
      interfaces: [`Node`, `Document`],
      extensions: {
        infer: false,
      },
    })
  );
}


// create fields for documents slugs and sources
exports.onCreateNode = async (
  { node, actions, getNode, createNodeId, store, cache, reporter },
) => {
  const { createNode, createParentChildLink } = actions;
  if (node.internal.type !== `Mdx`) return;

  // create source field according to source name passed to gatsby-source-filesystem
  const fileNode = getNode(node.parent);
  const source = fileNode.sourceInstanceName;

  const docConfig = config.documentSources[source];
  if (!docConfig) reporter.panic(`Unknown source of documents ${source}`);
  const { folder: folderLayout, path: pathTemplate } = docConfig;

  let slug, locale;
  if (node.frontmatter.slug) {
    // a relative slug gets turned into a sub path
    slug = node.frontmatter.slug;
    locale = match(pathTemplate)(path)?.params?.lang;
  } else {
    // otherwise use the filepath function from gatsby-source-filesystem
    const path = createFilePath({
      node: fileNode,
      getNode,
    });

    const pathMatch = match(folderLayout)(path);
    if (!pathMatch) reporter.panic(`Path ${path} does not match the layout ${folderLayout}`);

    const params = pathMatch.params;
    locale = params.lang;
    // remove default language from slug
    if (params.lang === config.defaultLanguage) params.lang = undefined;
    slug = compile(pathTemplate)(params);
  }

  // normalize use of trailing slash
  slug = slug.replace(/\/*$/, `/`);

  const fieldData = {
    title: node.frontmatter.title,
    tags: node.frontmatter.tags || [],
    slug,
    source,
    locale,
    date: node.frontmatter.date
  };

  const id = createNodeId(`${node.id} >>> MdxDocument`);
  await createNode({
    ...fieldData,
    // required fields
    id,
    parent: node.id,
    children: [],
    internal: {
      type: `MdxDocument`,
      contentDigest: createContentDigest(fieldData),
      contentFilePath: node.internal.contentFilePath,
      content: JSON.stringify(fieldData),
      description: `Mdx implementation of the Document interface`,
    },
  });
  createParentChildLink({ parent: node, child: getNode(id) });
}

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions;

  const result = await graphql(`
    {
      allDocument {
        nodes {
          id
          slug
          source
          frontmatter
          internal {
            contentFilePath
          }
        }
      }
    }
  `);

  if (result.errors) {
    reporter.panic(result.errors);
  }

  const { allDocument } = result.data;
  const docs = allDocument.nodes;

  // create pages for documents
  docs.forEach((doc, index) => {
    const previous = index === docs.length - 1 ? null : docs[index + 1];
    const next = index === 0 ? null : docs[index - 1];
    const { slug, frontmatter } = doc;
    createPage({
      path: slug,
      component: `${require.resolve(
        config.documentSources[doc.source]?.template
      )}?__contentFilePath=${doc.internal.contentFilePath}`,
      context: {
        id: doc.id,
        previousId: previous ? previous.id : undefined,
        nextId: next ? next.id : undefined,
        frontmatter
      },
    });
  })
}
