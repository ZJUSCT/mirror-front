import { Card, Grid, Typography } from "@mui/material";
import { CardActionArea } from "gatsby-theme-material-ui";
import * as React from "react";
import { Mirror } from "../types/mirror";
import StatusIndicator from "./status-indicator";

export default (props: { queryItem: Mirror }) => {


  return (
    <Card className="zju-mirror-card" style={{ height: "100%" }}>
      <CardActionArea
        to={props.queryItem.docUrl}
        style={{ height: "100%" }}
      >
        <Grid
          container
          direction="column"
          justifyContent="space-between"
          alignItems="flex-start"
          height="100%"
          padding={2}
        >
          <Grid item>
            <Typography variant="h6" component="div">
              {/* TODO: i18n */}
              {props.queryItem.name['zh']}
            </Typography>
            <Typography gutterBottom variant="body2" color="text.secondary">
              {props.queryItem.desc['zh']}
            </Typography>
          </Grid>
          <Grid item>
            <StatusIndicator status={props.queryItem.status} fontSize={12} />
          </Grid>
        </Grid>
      </CardActionArea>
    </Card>
  );
};
