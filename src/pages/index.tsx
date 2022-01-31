import React from "react";
import SearchTable from "../components/search-table";
import FrequentlyUsedMirrorCard from "../components/frequently-used-mirror-card";
import { Alert, Grid, Typography, Box } from "@mui/material";
import { fetchMirrorData } from "../utils/DataSource";
import { frequentlyUsedMirror } from "../utils/frequentlyUsedMirrorList";

export default ({ serverData }) => (
  <Box sx={{ backgroundColor: "#f2f7f9" }}>
    <Grid container spacing={{ xs: 6 }} columns={{ xs: 1 }} sx={{ p: 8 }}>
      <Grid item xs={1}>
        <Grid container columns={{ xs: 1 }}>
          <Grid item xs={1}>
            <Typography variant="h3" component="div" color="primary">
              ZJU Mirror
            </Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography variant="subtitle1" component="div" color="primary">
              浙江大学开源软件镜像站
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={1}>
        <Typography gutterBottom variant="h5" component="div">
          常用镜像
        </Typography>
        <Grid container spacing={{ xs: 2 }} columns={{ xs: 3, md: 6 }}>
          {frequentlyUsedMirror.map((e, i) => (
            <Grid item xs={1} key={i}>
              <FrequentlyUsedMirrorCard info={e} />
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Grid item xs={1}>
        <Typography gutterBottom variant="h5" component="div">
          所有镜像
        </Typography>
        <SearchTable queryResults={serverData.mirrorInfo} />
      </Grid>
    </Grid>
  </Box>
);

export async function getServerData() {
  const data = await fetchMirrorData();
  return {
    props: {
      ...data,
    },
  };
}
