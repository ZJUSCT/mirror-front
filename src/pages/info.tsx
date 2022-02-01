import React, { useEffect } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { fetchMirrorData } from "../utils/DataSource";
import Iso from "../components/iso";
import Usage from "../components/usage";

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
      <Box sx={{ backgroundColor: "#f2f7f9", p: 8 }}>
        <Typography variant="h5" component="div" color="primary">
          ZJU Mirror
        </Typography>
        <Grid
          container
          direction="column"
          justifyContent="flex-start"
          alignItems="flex-start"
        >
          <Typography gutterBottom variant="h2" component="div">
            {name}
          </Typography>
          {releaseInfo !== null ? (
            <Box>
              <Typography gutterBottom variant="h5" component="div">
                安装盘
              </Typography>
              <Grid container spacing={{ xs: 1 }} columns={{ xs: 1, md: 2 }}>
                {releaseInfo.urls
                  .filter((_, i) => i < 4)
                  .map((e, i) => (
                    <Grid item xs={1} key={i}>
                      <Iso info={e} />
                    </Grid>
                  ))}
              </Grid>
            </Box>
          ) : (
            <Box></Box>
          )}
        </Grid>
      </Box>
      <Box sx={{ p: 8 }}>
        <Usage name={name} />
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
