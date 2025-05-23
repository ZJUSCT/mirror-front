import {
  Box,
  Chip,
  ChipProps,
  Grid,
  IconButton,
  InputAdornment,
  InputBase,
  Link,
  Paper,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { graphql } from 'gatsby';
import { Trans, useI18next } from 'gatsby-plugin-react-i18next';
import React, { useEffect, useState, useRef } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import Fuse from 'fuse.js';
import Code from '../components/code';
import Footer from '../components/footer';
import FrequentlyUsedMirrorCard from '../components/frequently-used-mirror-card';
import LanguageIconButton from '../components/language-icon-button';
import SearchTable from '../components/search-table';
import NavBar from '../components/nav-bar';
import Seo from '../components/seo';
import ThemeIconButton from '../components/theme-icon-button';
import { Locale, Mirror, MirrorDto } from '../types/mirror';
import frequentlyUsedMirror from '../utils/frequently-used-mirror-list';
import { getUrl } from '../utils/url';
import { readCache, writeCache } from '../utils/cache';
import NameIconButton from '../components/name-icon-button';
import { ReactComponent as ZjuFalconIcon } from '../../resource/icons/zju-falcon.svg';

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

const networkMap: {
  [value: number]: {
    text: string;
    color: ChipProps['color'];
  };
} = {
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

const NoOverflowChip = styled(Chip)(() => ({
  '& .MuiChip-label': {
    overflow: 'unset',
    textOverflow: 'unset',
  },
}));

const Index = ({ data }: { data: Data }) => {
  const { language, t } = useI18next();

  const [networkMode, setNetworkMode] = useState<number>(
    readCache('networkMode', 0)
  );
  const [mirrorsRaw, setMirrorsRaw] = useState<MirrorDto[]>(
    readCache('mirrors', [])
  );
  const [searchInput, setSearchInput] = useState('');

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
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
            [d.frontmatter.title, new Date(d.frontmatter.date), d.slug] as [
              string,
              Date,
              string,
            ]
        )
        .sort((a, b) => b[1].getTime() - a[1].getTime()),
    [data, language]
  );

  const fuseSearch = React.useMemo(
    () =>
      new Fuse(Object.values(mirrors), {
        keys: ['id', `name.${language}`, `desc.${language}`],
      }),
    [mirrors, language]
  );

  const [searching, searchResults] = React.useMemo(() => {
    const input = searchInput.trim();
    if (input.length === 0) return [false, null];

    const searchedItems = fuseSearch.search(input).map(r => r.item);
    if (searchedItems.length === 0) return [false, null];
    return [true, searchedItems];
  }, [fuseSearch, searchInput]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ignore key-press while inputting in search bar
      const { tagName } = e.target as HTMLElement;
      if (
        tagName === 'INPUT' ||
        tagName === 'TEXTAREA' ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      if (e.key === '/') {
        e.preventDefault(); // prevent browser default behaviour
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          scrollBehavior: 'smooth',
        }}
      >
        <Seo title="ZJU Mirror" />
        <Grid
          container
          spacing={{ xs: 6 }}
          columns={{ xs: 1 }}
          sx={{ px: { xs: 4, sm: 8 }, py: 8 }}
        >
          <Grid size={12}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
              }}
            >
              <Box
                sx={{
                  minWidth: { xs: 54, sm: 72 },
                  maxWidth: { xs: 54, sm: 72 },
                }}
              >
                <ZjuFalconIcon />
              </Box>
              <Box sx={{ width: '100%', ml: 2 }}>
                <Grid
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Grid container direction="column">
                    <Typography
                      variant="h1"
                      component="div"
                      color="primary"
                      sx={{ fontSize: { xs: 48, sm: 64 }, mt: -1 }}
                    >
                      <Trans>ZJU Mirror</Trans>
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        mt: { xs: -1, sm: -2 },
                        flexWrap: 'wrap',
                        columnGap: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        component="div"
                        color="primary"
                        sx={{
                          whiteSpace: 'nowrap',
                          fontSize: { xs: 21, sm: 28 },
                        }}
                      >
                        <Trans>浙江大学开源软件镜像站</Trans>
                      </Typography>
                      <NoOverflowChip
                        size="medium"
                        label={t(networkMap[networkMode].text)}
                        color={networkMap[networkMode].color}
                        sx={{
                          fontSize: theme => theme.typography.subtitle1,
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid sx={{ display: 'block' }}>
                    <NameIconButton />
                    <LanguageIconButton />
                    <ThemeIconButton />
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Grid>
          <Grid size={12}>
            <Typography gutterBottom variant="h5" component="div">
              <Trans>常用镜像</Trans>
            </Typography>
            <Grid
              container
              spacing={{ xs: 2 }}
              columns={{ xs: 2, sm: 3, md: 6 }}
            >
              {frequentlyUsedMirror.map((e, i) => {
                const mirror = mirrors[e.id];
                return (
                  mirror && (
                    <Grid key={i} size={1}>
                      <FrequentlyUsedMirrorCard
                        name={mirror.name[language as Locale]}
                        desc={mirror.desc[language as Locale]}
                        icon={e.icon}
                        url={getUrl(
                          mirror.docUrl || mirror.url,
                          !!mirror.docUrl
                        )}
                      />
                    </Grid>
                  )
                );
              })}
            </Grid>
          </Grid>
          <Grid>
            <Typography gutterBottom variant="h5" component="div">
              <Trans>近期更新</Trans>
            </Typography>
            <Grid>
              {newsUrls.map(([title, date, url], i) => (
                <Grid container key={i}>
                  <Link href={url} underline="hover">
                    {title}
                  </Link>
                  <Typography color="info.light" component="div">
                    &nbsp; - {date.toLocaleDateString(language)}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Grid size={12}>
            <Typography gutterBottom variant="h5" component="div">
              <Trans>所有镜像</Trans>
            </Typography>
            <Box id="search-box">
              <Paper
                component="form"
                sx={{ my: 2, p: '2px 4px', display: 'flex' }}
              >
                <IconButton sx={{ p: '10px' }} aria-label="search">
                  <SearchIcon />
                </IconButton>
                <InputBase
                  sx={{ ml: 1, flex: 1 }}
                  placeholder={t('搜索镜像...') ?? ''}
                  endAdornment={
                    <InputAdornment position="end">
                      <Code>/</Code>
                    </InputAdornment>
                  }
                  inputProps={{ 'aria-label': 'search mirrors' }}
                  inputRef={inputRef}
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                />
              </Paper>
            </Box>
            <SearchTable
              queryResults={searchResults ?? Object.values(mirrors)}
              searching={searching}
              keyword={searchInput}
            />
          </Grid>
        </Grid>
        <Footer />
      </Box>
      <NavBar data={Object.values(mirrors)} searching={searching} />
    </>
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
