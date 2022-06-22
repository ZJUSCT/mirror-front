import { MDXProvider } from "@mdx-js/react";
import { ArrowBack } from "@mui/icons-material";
import FolderIcon from "@mui/icons-material/Folder";
import { Box, Grid, Typography } from "@mui/material";
import Paper from "@mui/material/Paper";
import { graphql } from "gatsby";
import { MDXRenderer } from "gatsby-plugin-mdx";
import { Trans, useI18next } from "gatsby-plugin-react-i18next";
import { Button } from "gatsby-theme-material-ui";
import React, { useEffect, useState } from "react";
import Footer from '../components/footer';
import FileList from "../components/file-list";
import LanguageIconButton from "../components/language-icon-button";
import Seo from "../components/seo";
import StatusIndicator from "../components/status-indicator";
import ThemeIconButton from "../components/theme-icon-button";
import { MirrorDto } from "../types/mirror";
import { Link } from "../utils/i18n-link";
import components from "./components";
import { readCache, writeCache } from "../utils/cache";
import { getUrl } from "../utils/url";

interface Data {
  document: {
    body: string,
    frontmatter: any
  }
}

async function fetchMirror(id: string): Promise<MirrorDto> {
  const res = await fetch(`/api/mirrors/${id}`);
  if (!res.ok) {
    throw new Error(`API call failed: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  writeCache(`mirrors_${id}`, json);
  return json;
}

export default ({ data }: { data: Data }) => {
  const { language } = useI18next();

  const defaultData = {
    id: data.document.frontmatter.mirrorId,
    name: {
      'zh': '',
      'en': ''
    },
    status: 'unknown',
  } as MirrorDto;
  const mirrorId = data.document.frontmatter.mirrorId;

  const [mirror, setMirror] = useState(readCache(`mirrors_${mirrorId}`, defaultData));
  useEffect(() => {
    fetchMirror(mirrorId)
      .then(d => setMirror(d))
      .catch(err => console.error(err));
  }, []);

  const name = mirror.name[language];
  return (
    <Box sx={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }}>
      <Seo title={`${name} | ZJU Mirror`} />
      <Box>
        <Box sx={{ px: { xs: 4, sm: 8 }, py: 4 }}>
          <Grid
            container
            direction="column"
            spacing={4}
            justifyContent="flex-start"
            alignItems="flex-start"
          >
            <Grid item sx={{ width: "100%" }}>
              <Grid container justifyContent="space-between">
                <Typography variant="h5" component="div" color="primary">
                  <Trans>ZJU Mirror</Trans>
                </Typography>
                <Grid item>
                  <LanguageIconButton />
                  <ThemeIconButton />
                </Grid>
              </Grid>
              <Link color="primary" underline="hover" to="/" sx={{ mt: 4, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <ArrowBack sx={{ fontSize: "1em", mr: .5 }} />
                <Typography variant="subtitle1">
                  <Trans>返回</Trans>
                </Typography>
              </Link>

              <Typography variant="h2" fontWeight={400} component="div">
                {name}
              </Typography>

              <Grid
                container
                direction="row"
                justifyContent="flex-start"
                alignItems="baseline"
              >
                <StatusIndicator status={mirror.status} />
                <Typography
                  variant="subtitle1"
                  component="div"
                  color="text.disabled"
                  sx={{ ml: 1 }}
                >
                  <Trans>最近更新于 {{ date: new Date(mirror.lastUpdated * 1000).toLocaleString(language) }}</Trans>
                </Typography>
              </Grid>

            </Grid>

            {
              (mirror.files?.length ?? 0) > 0 && (
                <Grid item width="100%">
                  <Box>
                    <Typography gutterBottom variant="h5" component="div">
                      <Trans>安装映像</Trans>
                    </Typography>

                    <FileList files={mirror.files || []} />
                  </Box>
                </Grid>
              )
            }

            {(data.document.frontmatter.isGit == undefined && !data.document.frontmatter.isGit) && <Grid item>
              <Button
                color="primary"
                size="large"
                variant="contained"
                startIcon={<FolderIcon />}
                to={getUrl(mirror.url, false)}
              >
                <Trans>文件列表</Trans>
              </Button>
            </Grid>}
          </Grid>
        </Box>
        <Paper sx={{ p: { xs: 4, sm: 8 } }} elevation={0}>
          <Typography gutterBottom variant="h5" component="div">
            <Trans>使用说明</Trans>
          </Typography>
          <MDXProvider components={components}>
            <MDXRenderer>{data.document.body}</MDXRenderer>
          </MDXProvider>
        </Paper>
      </Box>
      <Footer />
    </Box >
  );
};

export const query = graphql`
  query MirrorDocPageQuery(
    $id: String!
    $language: String!
  ) {
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
    locales: allLocale(filter: {language: {eq: $language}}) {
      edges {
        node {
          ns
          data
          language
        }
      }
    }
  }
`
