import React from "react";
import SearchTable from "../components/search-table";
import { Alert, Grid } from "@mui/material";
import { fetchMirrorData } from "../utils/DataSource";

export default ({ serverData }) => (
  <Grid container spacing={{ xs: 2 }} columns={{ xs: 1 }} sx={{p: 2}}>
    <Grid item xs={1}>
      <Alert severity="info">浙江大学开源软件镜像站试运行中...</Alert>
    </Grid>
    <Grid item xs={1}>
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
