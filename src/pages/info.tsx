import React, { useEffect } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { fetchMirrorData } from "../utils/DataSource";
import Iso from "../components/iso";
import Usage from "../components/usage";
import { Mirror } from "../types/mirrorz";
import { getStatusInfo } from "../components/search-item-card";
import type { statusInfo } from "../components/search-item-card";

export default ({ serverData }) => {
  const [name, setName] = React.useState("");
  const [releaseInfo, setReleaseInfo] = React.useState<any>(undefined);
  const [timeString, setTimeString] = React.useState<string>("");
  const [statusInfo, setStatusInfo] = React.useState<statusInfo>(undefined);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const name = params.get("name");
    setName(name);
    const target = serverData.releaseInfo.find(
      item => item.distro.substring(0, name.length) === name
    );
    setReleaseInfo(target);

    const mirror = serverData.mirrorInfo.find(
      item => item.cname === name
    ) as Mirror;

    setTimeString(getTime(mirror.status));
    setStatusInfo(getStatusInfo(mirror.status));
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
          <Grid item>
            <Typography variant="h2" component="div">
              {name}
            </Typography>
          </Grid>
          <Grid item marginBottom={4}>
            {statusInfo !== undefined ? (
              <Grid
                container
                direction="row"
                justifyContent="flex-start"
                alignItems="baseline"
                spacing={1}
              >
                <Grid item>
                  <Typography
                    variant="body1"
                    component="div"
                    color={`${statusInfo?.color}.main`}
                    fontWeight={1000}
                  >
                    {statusInfo.content.toUpperCase()}
                  </Typography>
                </Grid>
                {timeString !== "" ? (
                  <Grid item>
                    <Typography
                      variant="body2"
                      component="div"
                      color="text.disabled"
                      fontWeight={1000}
                    >
                      最近更新于 {timeString}
                    </Typography>
                  </Grid>
                ) : (
                  <></>
                )}
              </Grid>
            ) : (
              <></>
            )}
          </Grid>
          <Grid item width="100%">
            {releaseInfo !== undefined ? (
              <Box>
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
              </Box>
            ) : (
              <Box></Box>
            )}
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ p: 8 }}>
        <Usage name={name} />
      </Box>
    </Box>
  );
};

const getTime = (statusString: string): string => {
  let timeString: string = statusString.substring(1, 11);
  return timeString?.length === 10
    ? new Date(parseInt(timeString) * 1000).toLocaleString("zh-CN")
    : "";
};

export async function getServerData() {
  const data = await fetchMirrorData();
  return {
    props: {
      ...data,
    },
  };
}
