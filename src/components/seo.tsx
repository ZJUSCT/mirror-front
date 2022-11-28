import React from 'react';
import { JSX } from 'preact';
import { useStaticQuery, graphql } from 'gatsby';
import { useTheme } from '@mui/material';
import { Helmet } from 'gatsby-plugin-react-i18next';

type MetaProps = JSX.IntrinsicElements['meta'];

export interface SeoProps {
  description?: string;
  meta?: MetaProps[];
  title?: string;
}

export default ({ description, meta = [], title }: SeoProps) => {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
            author
          }
        }
      }
    `
  );

  const defaultTitle = site.siteMetadata?.title;
  const metaDescription = description || site.siteMetadata.description;
  const metaTitle = title || defaultTitle;

  const theme = useTheme();
  const defaultMeta: MetaProps[] = [
    {
      name: 'description',
      content: metaDescription,
    },
    {
      property: 'og:title',
      content: metaTitle,
    },
    {
      property: 'og:description',
      content: metaDescription,
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      name: 'twitter:card',
      content: 'summary',
    },
    {
      name: 'twitter:creator',
      content: site.siteMetadata?.author || '',
    },
    {
      name: 'twitter:title',
      content: metaTitle,
    },
    {
      name: 'twitter:description',
      content: metaDescription,
    },
    {
      name: 'theme-color',
      content: theme.palette.primary.light,
    },
  ];

  return <Helmet title={metaTitle} meta={defaultMeta.concat(meta)} />;
};
