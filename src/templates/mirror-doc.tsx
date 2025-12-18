import { MDXProvider } from '@mdx-js/react';
import FolderIcon from '@mui/icons-material/Folder';
import { Box, Grid, Typography } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import Paper from '@mui/material/Paper';
import { graphql } from 'gatsby';
import { Trans, useI18next } from 'gatsby-plugin-react-i18next';
import moment from 'moment';
import 'moment/locale/zh-cn';
import { LinkButton as Button } from '~/components/link-mui-components';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import Footer from '../components/footer';
import FileList from '../components/file-list';
import Seo from '../components/seo';
import StatusIndicator from '../components/status-indicator';
import ThemeIconButton from '../components/theme-icon-button';
import { Locale, MirrorDto } from '../types/mirror';
import { Link } from '../utils/i18n-link';
import components from './components';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { readCache } from '../utils/cache';
import { getUrl } from '../utils/url';
import TitleMirrorIcon from '../utils/title-mirror-icon';
import { getMirrorById, fetchMirrors } from '../utils/fetch-mirrors';

interface Data {
  document: {
    body: string;
    frontmatter: any;
  };
}

type MirrorDocProps = {
  data: Data;
};

const MirrorDoc = ({ data, children }: PropsWithChildren<MirrorDocProps>) => {
  const { language } = useI18next();

  // Use browser locale for moment on client side
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const browserLocale = navigator.language?.toLowerCase();
      if (browserLocale) moment.locale(browserLocale);
    }
  }, []);

  const defaultData = {
    id: data.document.frontmatter.mirrorId,
    name: {
      zh: '',
      en: '',
    },
    status: 'unknown',
  } as MirrorDto;
  const { mirrorId } = data.document.frontmatter;

  const [mirror, setMirror] = useState<MirrorDto>(
    getMirrorById(readCache('mirrors', [defaultData]), mirrorId, defaultData)
  );
  useEffect(() => {
    fetchMirrors()
      .then(d => setMirror(getMirrorById(d, mirrorId, defaultData)))
      .catch(err => console.error(err));
  }, []);

  const fallbackUrl = `/${mirrorId}`;
  const mirrorUrl = getUrl(mirror.url ?? fallbackUrl, false);

  const name = mirror.name[language as Locale];
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
      }}
    >
      <Seo title={`${name} | ZJU Mirror`} />
      <Box>
        <Box sx={{ px: { xs: 4, sm: 8 }, py: 4 }} position="relative">
          <Grid
            container
            direction="column"
            spacing={4}
            justifyContent="flex-start"
            alignItems="flex-start"
          >
            <Grid size={12}>
              <Grid container justifyContent="space-between">
                <Link
                  color="primary"
                  underline="hover"
                  to="/"
                  href="/"
                  onClick={e => e.preventDefault()}
                >
                  <Typography variant="h5" component="div" color="primary">
                    <Trans>ZJU Mirror</Trans>
                  </Typography>
                </Link>
                <Grid>
                  {/* TODO: add English docs
                    <LanguageIconButton />
                    */}
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
                {name === '' ? <Skeleton width="4em" /> : name}
              </Typography>

              <Grid
                container
                direction="row"
                justifyContent="flex-start"
                alignItems="center"
              >
                <Box sx={{ mr: 1 }}>
                  <StatusIndicator status={mirror.status} />
                </Box>
                <Typography
                  variant="subtitle1"
                  component="div"
                  color="text.disabled"
                  display={mirror.status === 'cached' ? 'none' : 'block'}
                >
                  <Trans>
                    最近更新于{' '}
                    {{
                      date: new Date(mirror.lastAttempt * 1000).toLocaleString(
                        language
                      ),
                    }}
                  </Trans>{' '}
                  ({moment(mirror.lastAttempt * 1000).fromNow()})
                </Typography>
              </Grid>
            </Grid>

            {(mirror.files?.length ?? 0) > 0 && (
              <Grid size={12}>
                <Box>
                  <Typography gutterBottom variant="h5" component="div">
                    <Trans>安装映像</Trans>
                  </Typography>

                  <FileList files={mirror.files || []} />
                </Box>
              </Grid>
            )}

            {!data.document.frontmatter?.isGit && (
              <Grid>
                <Button
                  color="primary"
                  size="medium"
                  variant="contained"
                  startIcon={<FolderIcon />}
                  to={mirrorUrl}
                  href={mirrorUrl}
                  hardNavigate
                >
                  <Trans>文件列表</Trans>
                </Button>
              </Grid>
            )}
          </Grid>
          <Box
            sx={{
              position: 'fixed',
              top: '6rem',
              right: { xs: '-4rem', sm: '5rem' },
              zIndex: -1,
            }}
          >
            <TitleMirrorIcon
              mirrorName={mirrorId}
              color="rgb(71 123 210 / 23%)"
              size="20rem"
            />
          </Box>
        </Box>
        <Box zIndex={1} position="sticky">
          <Paper sx={{ px: { xs: 4, sm: 8 }, py: 4 }} elevation={0}>
            <MDXProvider components={components}>{children}</MDXProvider>
          </Paper>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export const query = graphql`
  query MirrorDocPageQuery($id: String!, $language: String!) {
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

export default MirrorDoc;
