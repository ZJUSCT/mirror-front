import React from "react";
import { Card, CardActionArea, Grid, Typography } from "@mui/material";
import AlbumIcon from "@mui/icons-material/Album";
import { navigate } from "gatsby";
import { Trans } from "gatsby-plugin-react-i18next";

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
            variant="subtitle1"
            component="div"
            color="primary"
            fontWeight={400}
          >
            <Trans>ISO</Trans>
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="subtitle1" component="div">
            {props.info.name}
          </Typography>
        </Grid>
      </Grid>
    </CardActionArea>
  </Card>
);
