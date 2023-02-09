import { Box, Chip, Grid, Link, Typography, PaletteMode } from '@mui/material';
import { graphql } from 'gatsby';
import { Trans, useI18next } from 'gatsby-plugin-react-i18next';
import React, { useEffect, useState } from 'react';
import Footer from '../components/footer';
import FrequentlyUsedMirrorCard from '../components/frequently-used-mirror-card';
import LanguageIconButton from '../components/language-icon-button';
import SearchTable from '../components/search-table';
import Seo from '../components/seo';
import ThemeIconButton from '../components/theme-icon-button';
import { Mirror, MirrorDto } from '../types/mirror';
import { News, NewsDto } from '../types/news';
import frequentlyUsedMirror from '../utils/frequently-used-mirror-list';
import { getUrl } from '../utils/url';
import { readCache, writeCache } from '../utils/cache';
import NameIconButton from '../components/name-icon-button';
import ZjuFalconIcon from '../../resource/icons/zju-falcon.svg';
import ZjuFalconIconDark from '../../resource/icons/zju-falcon-dark.svg';
import { ThemeMode, useMode } from '../components/theme-context';

interface Data {
  mirrorDocs: {
    nodes: {
      slug: string;
      locale: string;
      frontmatter?: {
        mirrorId?: string;
      };
    }[];
  };
  news: {
    nodes: {
      slug: string;
      locale: string;
      frontmatter: {
        name: string;
        title: string;
        date: string;
        author: string;
      };
    }[];
  };
}

const networkMap = {
  0: {
    text: '校外网络',
    color: 'primary',
  },
  1: {
    text: '校内网络 - IPv4',
    color: 'success',
  },
  2: {
    text: '校内网络 - IPv6',
    color: 'success',
  },
};

async function fetchMirrors(): Promise<MirrorDto[]> {
  const res = await fetch('/api/mirrors');
  if (!res.ok) {
    throw new Error(`API call failed: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  writeCache('mirrors', json);
  return json;
}

async function fetchNetworkMode(): Promise<number> {
  const res = await fetch('/api/is_campus_network');
  if (!res.ok) {
    return 0;
  }
  const json = await res.json();
  const c = Number.isInteger(json) ? json : 0;
  writeCache('networkMode', c);
  return c;
}

const Index = ({ data }: { data: Data }) => {
  const { language, t } = useI18next();

  const [networkMode, setNetworkMode] = useState<number>(
    readCache('networkMode', 0)
  );
  const [mirrorsRaw, setMirrorsRaw] = useState<MirrorDto[]>(
    readCache('mirrors', [])
  );

  useEffect(() => {
    fetchMirrors()
      .then(d => setMirrorsRaw(d))
      .catch(err => console.error(err));
    fetchNetworkMode()
      .then(d => setNetworkMode(d))
      .catch(err => console.error(err));
  }, []);

  const mirrorDocUrls = React.useMemo<Record<string, string>>(
    () =>
      Object.fromEntries(
        data.mirrorDocs.nodes
          .filter(d => d.frontmatter?.mirrorId && d.locale === language)
          .map(d => [d.frontmatter!.mirrorId, d.slug])
      ),
    [data, language]
  );

  const mirrors = React.useMemo<{ [key in string]: Mirror }>(
    () =>
      Object.fromEntries(
        mirrorsRaw.map(dto => [
          dto.id,
          {
            ...dto,
            docUrl: mirrorDocUrls[dto.id],
          },
        ])
      ),
    [mirrorsRaw, mirrorDocUrls]
  );
  const newsUrls = React.useMemo<Array<[string, Date, string]>>(
    () =>
      data.news.nodes
        .filter(d => d.locale === language)
        .map(
          d =>
            [d.frontmatter.title, new Date(d.frontmatter.date), d.slug] as (
              | Date
              | string
            )[]
        )
        .sort((a, b) => b[1] - a[1]),
    [data, language]
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Seo title="ZJU Mirror" />
      <Grid
        container
        spacing={{ xs: 6 }}
        columns={{ xs: 1 }}
        sx={{ px: { xs: 4, sm: 8 }, py: 8 }}
      >
        <Grid item xs={1}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            <Box sx={{ minWidth: 100, maxWidth: 100 }}>
              {
                // FIXME: this expression does not deal with theme mode 'auto'
                (useMode() ?? ['auto', () => {}])[0] === 'light' ? (
                  <ZjuFalconIcon />
                ) : (
                  <ZjuFalconIconDark />
                )
              }
            </Box>
            <Box sx={{ width: '100%', ml: 2 }}>
              <Grid
                container
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Grid item>
                  <Typography variant="h1" component="div" color="primary">
                    <Trans>ZJU Mirror</Trans>
                  </Typography>
                </Grid>
                <Grid item>
                  <NameIconButton />
                  <LanguageIconButton />
                  <ThemeIconButton />
                </Grid>
              </Grid>
              <Typography variant="subtitle1" component="div" color="primary">
                <Trans>浙江大学开源软件镜像站</Trans>
              </Typography>
              <Typography variant="subtitle1" component="div" color="primary">
                <Chip
                  size="small"
                  label={t(networkMap[networkMode].text)}
                  color={networkMap[networkMode].color}
                />
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={1}>
          <Typography gutterBottom variant="h5" component="div">
            <Trans>常用镜像</Trans>
          </Typography>
          <Grid container spacing={{ xs: 2 }} columns={{ xs: 1, sm: 3, md: 6 }}>
            {frequentlyUsedMirror.map((e, i) => {
              const mirror = mirrors[e.id];
              return (
                mirror && (
                  <Grid item xs={1} key={i}>
                    <FrequentlyUsedMirrorCard
                      name={mirror.name[language]}
                      desc={mirror.desc[language]}
                      icon={e.icon}
                      url={getUrl(mirror.docUrl || mirror.url, !!mirror.docUrl)}
                    />
                  </Grid>
                )
              );
            })}
          </Grid>
        </Grid>
        <Grid item xs={1}>
          <Typography gutterBottom variant="h5" component="div">
            <Trans>近期更新</Trans>
          </Typography>
          <Grid>
            {newsUrls.map(([title, date, url], _) => (
              <Grid container>
                <Link href={url} underline="hover">
                  {title}
                </Link>
                <Typography color="info.light" component="div">
                  &nbsp; - {date.toLocaleDateString()}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid item xs={1}>
          <Typography gutterBottom variant="h5" component="div">
            <Trans>所有镜像</Trans>
          </Typography>
          <SearchTable queryResults={Object.values(mirrors)} />
        </Grid>
      </Grid>
      <Footer />
    </Box>
  );
};

export const query = graphql`
  query ($language: String!) {
    mirrorDocs: allDocument(filter: { source: { eq: "mirrors" } }) {
      nodes {
        frontmatter
        slug
        locale
      }
    }
    news: allDocument(filter: { source: { eq: "news" } }) {
      nodes {
        frontmatter
        slug
        locale
      }
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

export default Index;
