import { MDXProvider } from '@mdx-js/react';
import { DateRange, AccountCircle } from '@mui/icons-material';
import { Box, Grid, Typography } from '@mui/material';
import Paper from '@mui/material/Paper';
import { graphql } from 'gatsby';
import { Trans, useI18next } from 'gatsby-plugin-react-i18next';
import React from 'react';
import Footer from '../components/footer';
import LanguageIconButton from '../components/language-icon-button';
import Seo from '../components/seo';
import ThemeIconButton from '../components/theme-icon-button';
import { NewsDto } from '../types/news';
import { Link } from '../utils/i18n-link';
import components from './components';

interface Data {
  document: {
    body: string;
    frontmatter: any;
  };
}

const News = ({ data, children }: { data: Data }) => {
  const { language } = useI18next();

  const news = {
    name: data.document.frontmatter.name,
    title: data.document.frontmatter.title,
    author: data.document.frontmatter.author,
    date: data.document.frontmatter.date,
  } as NewsDto;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Seo title={`${news.title} | 镜像站新闻 | ZJU Mirror`} />
      <Box>
        <Box sx={{ px: { xs: 4, sm: 8 }, py: 4 }}>
          <Grid
            container
            direction="column"
            spacing={4}
            justifyContent="flex-start"
            alignItems="flex-start"
          >
            <Grid item sx={{ width: '100%' }}>
              <Grid container justifyContent="space-between">
                <Link color="primary" underline="hover" to="/">
                  <Typography variant="h5" component="div" color="primary">
                    <Trans>ZJU Mirror</Trans>
                  </Typography>
                </Link>
                <Grid item>
                  <LanguageIconButton />
                  <ThemeIconButton />
                </Grid>
              </Grid>
              <Box
                sx={{
                  mt: 4,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              />

              <Typography variant="h2" fontWeight={400} component="div">
                {news.title}
              </Typography>

              <Grid
                container
                direction="row"
                justifyContent="flex-start"
                alignItems="baseline"
              >
                <Typography
                  variant="subtitle1"
                  component="div"
                  color="text.disabled"
                  sx={{ ml: 1 }}
                >
                  <AccountCircle sx={{ fontSize: '1em', mr: 0.5 }} />
                  <Trans> {news.author}</Trans>
                </Typography>

                <Typography
                  variant="subtitle1"
                  component="div"
                  color="text.disabled"
                  sx={{ ml: 1 }}
                >
                  <DateRange sx={{ fontSize: '1em', mr: 0.5 }} />
                  <Trans>
                    {' '}
                    {{ date: new Date(news.date).toLocaleDateString(language) }}
                  </Trans>
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Box>
        <Paper sx={{ px: { xs: 4, sm: 8 }, py: 4 }} elevation={0}>
          <MDXProvider components={components}>
            {children}
          </MDXProvider>
        </Paper>
      </Box>
      <Footer />
    </Box>
  );
};

export const query = graphql`
  query NewsPageQuery($id: String!, $language: String!) {
    document(id: { eq: $id }) {
      id
      body
      slug
      title
      tags
      date(formatString: "MMMM DD, YYYY")
      tableOfContents
      frontmatter
    }
    locales: allLocale(filter: { language: { eq: $language } }) {
      edges {
        node {
          ns
          data
          language
        }
      }
    }
  }
`;

export default News;
