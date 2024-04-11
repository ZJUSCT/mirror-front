import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { useTheme } from '@mui/material';
import { useI18next } from 'gatsby-plugin-react-i18next';

type MetaProps = React.JSX.IntrinsicElements['meta'];

const Helmet: React.FC = ({children, title, meta}) => {
  const {languages, language, originalPath, defaultLanguage, siteUrl = ''} = useI18next();
  const createUrlWithLang = (lng: string) => {
    const url = `${siteUrl}${lng === defaultLanguage ? '' : `/${lng}`}${originalPath}`;
    return url.endsWith('/') ? url : `${url}/`;
  };
  return (
    <>
      <html lang={language} />
      <title>{title}</title>
      {meta?.map((m: MetaProps, i: number) => <meta {...m} key={i}/>)}
      <link rel="canonical" href={createUrlWithLang(language)} />
      {languages.map((lng) => (
        <link rel="alternate" key={lng} href={createUrlWithLang(lng)} hrefLang={lng} />
      ))}
      {/* adding a fallback page for unmatched languages */}
      <link rel="alternate" href={createUrlWithLang(defaultLanguage)} hrefLang="x-default" />
      {children}
    </>
  );
};

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
      content: theme.palette.primary.main,
    },
  ];

  return <Helmet title={metaTitle} meta={defaultMeta.concat(meta)} />;
};
