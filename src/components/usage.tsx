import React, { useEffect } from "react";
import { Box, Grid, Typography } from "@mui/material";
import Ubuntu from "../../doc/ubuntu.mdx";
import CentOS from "../../doc/centos.mdx";
import Debian from "../../doc/debian.mdx";
import PyPI from "../../doc/pypi.mdx";
import UbuntuPorts from "../../doc/ubuntu-ports.mdx";

const wrapper = (doc: React.ReactNode) => (
  <Grid
    container
    direction="column"
    justifyContent="flex-start"
    alignItems="flex-start"
  >
    <Typography gutterBottom variant="h5" component="div">
      使用说明
    </Typography>
    {doc}
  </Grid>
);

export default (props: { name: string }) =>
  props.name.toLowerCase() === "ubuntu" ? (
    wrapper(<Ubuntu />)
  ) : props.name.toLowerCase() === "centos" ? (
    wrapper(<CentOS />)
  ) : props.name.toLowerCase() === "debian" ? (
    wrapper(<Debian />)
  ) : props.name.toLowerCase() === "pypi" ? (
    wrapper(<PyPI />)
  ) : props.name.toLowerCase() === "ubuntu ports" ? (
    wrapper(<UbuntuPorts />)
  ) : (
    <Box></Box>
  );
