import { MDXProvider } from "@mdx-js/react";
import FolderIcon from "@mui/icons-material/Folder";
import { Box, Grid, Link, Typography } from "@mui/material";
import Paper from "@mui/material/Paper";
import { graphql } from "gatsby";
import { MDXRenderer } from "gatsby-plugin-mdx";
import { Trans } from "gatsby-plugin-react-i18next";
import { Button } from "gatsby-theme-material-ui";
import React from "react";
import Footer from '../components/footer';
import Iso from "../components/iso";
import StatusIndicator from "../components/status-indicator";
import { Mirror } from "../types/mirror";
import { getMirror } from "../utils/api";
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
  const mirror = serverData.mirror;

  return (
    <Box sx={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }}>
      <Box>
        <Box sx={{ p: 8 }}>
          <Grid
            container
            direction="column"
            spacing={4}
            justifyContent="flex-start"
            alignItems="flex-start"
          >
            <Grid item>
              <Typography variant="h5" component="div" color="primary">
                <Link color="primary" underline="hover" href="/">
                  <Trans>ZJU Mirror</Trans>
                </Link>
              </Typography>
              <Typography variant="h2" fontWeight={400} component="div">
                {mirror.name['zh']}
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
                  <Trans>最近更新于 {new Date(mirror.lastUpdated).toLocaleString()}</Trans>
                </Typography>
              </Grid>

            </Grid>

            {Object.keys(mirror.isoDict).length && (
              <Grid item width="100%">
                <Box>
                  <Typography gutterBottom variant="h5" component="div">
                    <Trans>安装盘</Trans>
                  </Typography>

                  {/* TODO: show more ISOs */}
                  <Grid container spacing={{ xs: 1 }} columns={{ xs: 1, md: 2 }}>
                    {
                      Object.entries(mirror.isoDict)
                        .filter((_, i) => i < 4)
                        .map((e, i) => (
                          <Grid item xs={1} key={i}>
                            <Iso info={e} />
                          </Grid>
                        ))
                    }
                  </Grid>
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
        <Paper sx={{ p: 8 }} elevation={0}>
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
