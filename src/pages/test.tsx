import { Box, Grid, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { fetchMirrorData } from "../utils/DataSource";
import Iso from "../components/iso";
import Ubuntu from "./help/ubuntu.mdx";

export default ({ serverData }) => {
  const [name, setName] = React.useState("");
  const [releaseInfo, setReleaseInfo] = React.useState<any>(null);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const name = params.get("name");
    console.log(serverData);
    setName(name);
    for (const item of serverData.releaseInfo) {
      console.log(item.distro.substring(0, name.length));
      if (item.distro.substring(0, name.length) === name) {
        setReleaseInfo(item);
        console.log(item);
        break;
      }
    }
  }, []);
  return (
    <Box>
      <Box sx={{ backgroundColor: "#F2F7F9", p: 4 }}>
        <Grid
          container
          direction="column"
          justifyContent="flex-start"
          alignItems="flex-start"
        >
          <Typography gutterBottom variant="h2" component="div">
            {name}
          </Typography>
          <Typography gutterBottom variant="h5" component="div">
            安装盘
          </Typography>
          <Grid container spacing={{ xs: 1 }} columns={{ xs: 1, md: 2 }}>
            {releaseInfo?.urls
              .filter((_, i) => i < 4)
              .map((e, i) => (
                <Grid item xs={1} key={i}>
                  <Iso info={e} />
                </Grid>
              ))}
          </Grid>
        </Grid>
      </Box>
      <Box sx={{p: 4 }}>
        <Grid
          container
          direction="column"
          justifyContent="flex-start"
          alignItems="flex-start"
        >
          <Typography gutterBottom variant="h5" component="div">
            安装盘
          </Typography>
          <Ubuntu />
        </Grid>
      </Box>
    </Box>
  );
};

export async function getServerData() {
  const data = await fetchMirrorData();
  return {
    props: {
      ...data,
    },
  };
}
