import React from "react";
import { Card, Grid, Typography } from "@mui/material";
import AlbumIcon from "@mui/icons-material/Album";
import { Trans } from "gatsby-plugin-react-i18next";
import { CardActionArea } from "gatsby-theme-material-ui";

export interface IsoProps {
  name: string;
  url: string;
}

export default function Iso({ name, url }: IsoProps) {
  return (
    <Card className="zju-mirror-card" style={{ height: "100%" }}>
      <CardActionArea to={url} sx={{ p: 2 }}>
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
              {name}
            </Typography>
          </Grid>
        </Grid>
      </CardActionArea>
    </Card>
  );
}
