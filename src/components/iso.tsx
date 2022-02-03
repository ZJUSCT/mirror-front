import React from "react";
import { Card, CardActionArea, Grid, Typography } from "@mui/material";
import AlbumIcon from "@mui/icons-material/Album";
import { navigate } from "gatsby";

export default (props: { info: any }) => (
  <Card className="zju-mirror-card" style={{ height: "100%" }}>
    <CardActionArea onClick={() => navigate(props.info.url)} sx={{ p: 2 }}>
      <Grid
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        spacing={1}
      >
        <Grid item>
          <AlbumIcon color="primary" />
        </Grid>
        <Grid item>
          <Typography
            variant="body1"
            component="div"
            fontWeight={1000}
            color="primary"
          >
            ISO
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="body1" component="div" fontWeight={1000}>
            {props.info.name}
          </Typography>
        </Grid>
      </Grid>
    </CardActionArea>
  </Card>
);
