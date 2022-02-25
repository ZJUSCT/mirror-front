import React from "react";
import SearchTable from "../components/search-table";
import FrequentlyUsedMirrorCard from "../components/frequently-used-mirror-card";
import { Grid, Typography, Box } from "@mui/material";
import frequentlyUsedMirror from "../utils/frequently-used-mirror-list";
import { getMirrors } from "../utils/api";
import { Mirror, MirrorDto } from "../types/mirror";
import { graphql } from "gatsby";
import ThemeIconButton from "../components/theme-icon-button";

interface Data {
  mirrorDocs: {
    nodes: {
      slug: string,
      locale: string,
      frontmatter?: {
        mirrorId?: string,
      }
    }[]
  }
}

interface ServerData {
  mirrors: MirrorDto[]
}

export default ({ serverData, data }: { serverData: ServerData, data: Data }) => {
  const mirrorDocUrls = React.useMemo<Record<string, string>>(() =>
    Object.fromEntries(
      data.mirrorDocs.nodes
        .filter(d => d.frontmatter?.mirrorId) // TODO: filter locales
        .map(d => [d.frontmatter.mirrorId, d.slug])
    ),
    [data]
  );

  const mirrors = React.useMemo<{ [key in string]: Mirror }>(() =>
    Object.fromEntries(
      serverData.mirrors.map(dto => ([
        dto.id, {
          ...dto,
          docUrl: mirrorDocUrls[dto.id],
        }
      ]))),
    [serverData, mirrorDocUrls]
  );

  return (
    <Box>
      <Grid container spacing={{ xs: 6 }} columns={{ xs: 1 }} sx={{ px: { xs: 4, sm: 8 }, py: 8 }}>
        <Grid item xs={1}>
          <Grid container direction="row" justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h3" component="div" color="primary">
                ZJU Mirror
              </Typography>
              <Typography variant="subtitle1" component="div" color="primary">
                浙江大学开源软件镜像站
              </Typography>
            </Grid>
            <Grid item>
              <ThemeIconButton />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={1}>
          <Typography gutterBottom variant="h5" component="div">
            常用镜像
          </Typography>
          <Grid container spacing={{ xs: 2 }} columns={{ xs: 1, sm: 3, md: 6 }}>
            {
              frequentlyUsedMirror.map((e, i) => {
                const mirror = mirrors[e.id];
                return mirror && (
                  <Grid item xs={1} key={i}>
                    <FrequentlyUsedMirrorCard
                      name={mirror.name['zh']}
                      desc={mirror.desc['zh']}
                      icon={e.icon}
                      url={mirror.docUrl || mirror.url}
                    />
                  </Grid>
                )
              })
            }
          </Grid>
        </Grid>
        <Grid item xs={1}>
          <Typography gutterBottom variant="h5" component="div">
            所有镜像
          </Typography>
          <SearchTable queryResults={Object.values(mirrors)} />
        </Grid>
      </Grid>
    </Box>
  )
};

export const query = graphql`
{
  mirrorDocs: allDocument(filter: {source: {eq: "mirrors"}}) {
    nodes {
      frontmatter
      slug
      locale
    }
  }
}
`;

export async function getServerData() {
  return {
    props: {
      mirrors: await getMirrors()
    },
  };
}
