import React, { useState, useEffect } from "react";
import { Box, Grid, Typography, Link, Button } from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import { fetchMirrorData } from "../utils/DataSource";
import Iso from "../components/iso";
import Usage from "../components/usage";
import { Mirror } from "../types/mirrorz";
import { getStatusInfo } from "../components/search-item-card";
import type { statusInfo } from "../components/search-item-card";
import { navigate } from "gatsby";

export default ({ serverData }) => {
  const [name, setName] = useState("");
  const [releaseInfo, setReleaseInfo] = useState<any>(undefined);
  const [timeString, setTimeString] = useState<string>("");
  const [statusInfo, setStatusInfo] = useState<statusInfo>(undefined);
  const [isoUrl, setIsoUrl] = useState<string>("");
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const name = params.get("name");
    setName(name);
    console.log(serverData.releaseInfo);
    const target = serverData.releaseInfo.find(
      item => item.distro.substring(0, name.length) === name
    );
    setReleaseInfo(target);
    setIsoUrl(longestCommonPrefix(target?.urls.map(x => x.url)));

    const mirror = serverData.mirrorInfo.find(
      item => item.cname === name
    ) as Mirror;

    if (mirror !== undefined) {
      setUrl(mirror.url);
      setTimeString(getTime(mirror.status));
      setStatusInfo(getStatusInfo(mirror.status));
    }
  }, []);

  return (
    <Box>
      <Box sx={{ backgroundColor: "#f2f7f9", p: 8 }}>
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
                ZJU Mirror
              </Link>
            </Typography>
            <Typography variant="h2" fontWeight={400} component="div">
              {name}
            </Typography>
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
                    variant="subtitle1"
                    component="div"
                    color={`${statusInfo?.color}.main`}
                  >
                    {statusInfo.content.toUpperCase()}
                  </Typography>
                </Grid>
                {timeString !== "" ? (
                  <Grid item>
                    <Typography
                      variant="subtitle1"
                      component="div"
                      color="text.disabled"
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

          {releaseInfo !== undefined ? (
            <Grid item width="100%">
              <Box>
                <Grid
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Grid item>
                    <Typography gutterBottom variant="h5" component="div">
                      安装盘
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography
                      gutterBottom
                      variant="subtitle1"
                      component="div"
                    >
                      <Link color="primary" underline="hover" href={isoUrl}>
                        更多安装盘
                      </Link>
                    </Typography>
                  </Grid>
                </Grid>
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
            </Grid>
          ) : (
            <Box></Box>
          )}

          <Grid item>
            <Button
              color="primary"
              size="large"
              variant="contained"
              startIcon={<FolderIcon />}
              onClick={() => {
                navigate(url);
              }}
            >
              文件列表
            </Button>
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ backgroundColor: "#ffffff", p: 8 }}>
        <Usage name={name} />
      </Box>
    </Box>
  );
};

const longestCommonPrefix = (urlArray: string[]): string => {
  if (urlArray === undefined || urlArray.length === 0) {
    return "";
  }
  return urlArray.reduce((prev, curr) => {
    const length = Math.min(prev.length, curr.length);
    let index = 0;
    for (; index < length && prev.at(index) === curr.at(index); index++);
    return prev.substring(0, index);
  });
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
