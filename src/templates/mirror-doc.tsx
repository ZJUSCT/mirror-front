import { MDXProvider } from "@mdx-js/react";
import { ArrowBack } from "@mui/icons-material";
import FolderIcon from "@mui/icons-material/Folder";
import { Box, Grid, Typography } from "@mui/material";
import Paper from "@mui/material/Paper";
import { graphql } from "gatsby";
import { MDXRenderer } from "gatsby-plugin-mdx";
import { Trans, useI18next } from "gatsby-plugin-react-i18next";
import { Button } from "gatsby-theme-material-ui";
import React from "react";
import Footer from '../components/footer';
import FileList from "../components/file-list";
import LanguageIconButton from "../components/language-icon-button";
import Seo from "../components/seo";
import StatusIndicator from "../components/status-indicator";
import ThemeIconButton from "../components/theme-icon-button";
import { Mirror } from "../types/mirror";
import { getMirror } from "../utils/api";
import { Link } from "../utils/i18n-link";
import components from "./components";

interface Data {
  document: {
    body: string
  }
}

interface ServerData {
  mirror: Mirror
}

export default ({ data, serverData }: { data: Data, serverData: ServerData }) => {
  const { language } = useI18next();
  const mirror = serverData.mirror;
  const name = mirror.name[language]

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
                  <Trans>最近更新于 {{ date: new Date(mirror.lastUpdated).toLocaleString(language) }}</Trans>
                </Typography>
              </Grid>

            </Grid>

            {mirror.files?.length && (
              <Grid item width="100%">
                <Box>
                  <Typography gutterBottom variant="h5" component="div">
                    <Trans>安装映像</Trans>
                  </Typography>

                  <FileList files={mirror.files || []}/>
                </Box>
              </Grid>
            )}

            <Grid item>
              <Button
                color="primary"
                size="large"
                variant="contained"
                startIcon={<FolderIcon />}
                to={mirror.url}
              >
                <Trans>文件列表</Trans>
              </Button>
            </Grid>
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

export async function getServerData({ pageContext }) {
  return {
    props: {
      mirror: await getMirror(pageContext?.frontmatter?.mirrorId)
    },
  };
}

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
