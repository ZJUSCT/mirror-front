import React from "react";
import SearchTable from "../components/search-table";
import { Alert, Grid, Typography } from "@mui/material";
import { fetchMirrorData } from "../utils/DataSource";

export default ({ serverData }) => (
  <Grid container spacing={{ xs: 2 }} columns={{ xs: 1 }} sx={{ p: 8 }}>
    <Grid item xs={1}>
      <Grid container columns={{ xs: 1 }}>
        <Grid item xs={1}>
          <Typography variant="h3" component="div">
            ZJU Mirror
          </Typography>
        </Grid>
        <Grid item xs={1}>
          <Typography variant="h6" component="div">
            浙江大学开源软件镜像站
          </Typography>
        </Grid>
      </Grid>
    </Grid>
    <Grid item xs={1}>
      <Alert severity="info">浙江大学开源软件镜像站试运行中...</Alert>
    </Grid>
    <Grid item xs={1}>
      <Typography gutterBottom variant="h5" component="div">
        所有镜像
      </Typography>
      <SearchTable queryResults={serverData.mirrorInfo} />
    </Grid>
  </Grid>
);

export async function getServerData() {
  const data = await fetchMirrorData();
  return {
    props: {
      ...data,
    },
  };
}
