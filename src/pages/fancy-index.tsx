import { Box, Grid, Typography } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import Paper from '@mui/material/Paper';
import FolderIcon from '@mui/icons-material/Folder';
import { Trans, useI18next } from 'gatsby-plugin-react-i18next';
import moment from 'moment';
import 'moment/locale/zh-cn';
import React, { useEffect, useState } from 'react';
import parse from 'html-react-parser';
import DOMPurify from 'isomorphic-dompurify';
import Footer from '../components/footer';
import Seo from '../components/seo';
import StatusIndicator from '../components/status-indicator';
import ThemeIconButton from '../components/theme-icon-button';
import { Locale, MirrorDto } from '../types/mirror';
import { Link } from '../utils/i18n-link';
import TitleMirrorIcon from '../utils/title-mirror-icon';
import { getMirrorById, fetchMirrors } from '../utils/fetch-mirrors';
import { readCache } from '../utils/cache';

const MirrorFancyIndex = () => {
  const { language } = useI18next();

  // Use browser locale for moment on client side
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const browserLocale = navigator.language?.toLowerCase();
      if (browserLocale) moment.locale(browserLocale);
    }
  }, []);

  const { pathname } = window.location;
  const mirrorId = React.useMemo(
    () => pathname.split('/').filter(Boolean)[0] ?? '',
    [pathname]
  );

  const defaultData = {
    id: mirrorId,
    name: {
      zh: '',
      en: '',
    },
    status: 'unknown',
  } as MirrorDto;

  const [mirror, setMirror] = useState<MirrorDto>(
    getMirrorById(readCache('mirrors', [defaultData]), mirrorId, defaultData)
  );

  useEffect(() => {
    fetchMirrors()
      .then(d => setMirror(getMirrorById(d, mirrorId, defaultData)))
      .catch(err => console.error(err));
  }, []);

  const name = mirror.name[language as Locale];

  const [slotHtml, setSlotHtml] = useState<string>('');
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const start = document.getElementById('fancy-start');
    const end = document.getElementById('fancy-end');
    if (!start || !end) return;
    const parts: string[] = [];
    let node: ChildNode | null = start.nextSibling;
    while (node && node !== end) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        parts.push((node as Element).outerHTML);
      }
      node = node.nextSibling;
    }
    setSlotHtml(parts.join(''));
  }, []);

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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <FolderIcon />
              <Typography variant="h6">
                Index of <code>{pathname}</code>
              </Typography>
            </Box>
            <div className="fancy-index">
              {parse(DOMPurify.sanitize(slotHtml))}
            </div>
          </Paper>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default MirrorFancyIndex;
