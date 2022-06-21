import { Card, Grid, Typography } from "@mui/material";
import { useI18next } from "gatsby-plugin-react-i18next";
import { CardActionArea } from "gatsby-theme-material-ui";
import * as React from "react";
import { Mirror } from "../types/mirror";
import StatusIndicator from "./status-indicator";
import { getUrl } from "../utils/url";
import { usePrefs } from "./preferences-context";

export default (props: { queryItem: Mirror }) => {
  const { language } = useI18next();
  const [prefs, _] = usePrefs();

  return (
    <Card className="zju-mirror-card" style={{ height: "100%" }}>
      <CardActionArea
        to={getUrl(props.queryItem.docUrl || props.queryItem.url, !props.queryItem.url)}
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
              {prefs.friendlyName ? props.queryItem.name[language] : props.queryItem.id}
            </Typography>
            <Typography gutterBottom variant="body2" color="text.secondary">
              {props.queryItem.desc[language]}
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
