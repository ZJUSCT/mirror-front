import React from "react";
import { Card, Grid, Typography } from "@mui/material";
import AlbumIcon from "@mui/icons-material/Album";

export default (props: { info: any }) => (
  <Card sx={{ p: 2, boxShadow: 4 }}>
    <Grid
      container
      direction="row"
      justifyContent="flex-start"
      alignItems="center"
      spacing={1}
    >
      <Grid item>
        <AlbumIcon />
      </Grid>
      <Grid item>
        <Typography variant="body1" component="div">
          ISO
        </Typography>
      </Grid>
      <Grid item>
        <Typography variant="body1" component="div">
          {props.info.name}
        </Typography>
      </Grid>
    </Grid>
  </Card>
);
