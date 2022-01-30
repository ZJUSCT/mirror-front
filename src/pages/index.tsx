import React from "react";
import SearchTable from "../components/search-table";
import FrequentlyUsedMirrorCard from "../components/frequently-used-mirror-card";
import type { mirrorBrief } from "../components/frequently-used-mirror-card";
import { Alert, Grid, Typography } from "@mui/material";
import { fetchMirrorData } from "../utils/DataSource";

const frequentlyUsedMirror: mirrorBrief[] = [
  {
    name: "Ubuntu",
    img: "https://simpleicons.org/icons/ubuntu.svg",
    desc: "Ubuntu 软件包",
  },
  {
    name: "NPM",
    img: "https://simpleicons.org/icons/npm.svg",
    desc: "Node.JS 程序库",
  },
  {
    name: "PyPI",
    img: "https://simpleicons.org/icons/python.svg",
    desc: "Python PIP 程序库",
  },
  {
    name: "Arch Linux",
    img: "https://simpleicons.org/icons/archlinux.svg",
    desc: "Arch Linux 软件包",
  },
  {
    name: "CentOS",
    img: "https://simpleicons.org/icons/centos.svg",
    desc: "CentOS 软件包",
  },
  {
    name: "Docker",
    img: "https://simpleicons.org/icons/docker.svg",
    desc: "Docker 应用镜像",
  },
];

export default ({ serverData }) => (
  <Grid container spacing={{ xs: 6 }} columns={{ xs: 1 }} sx={{ p: 8 }}>
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
);

export async function getServerData() {
  const data = await fetchMirrorData();
  return {
    props: {
      ...data,
    },
  };
}
