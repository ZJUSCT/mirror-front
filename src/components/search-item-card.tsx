import * as React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CardActionArea,
} from "@mui/material";
import { navigate } from "gatsby";
import type { Mirror } from "../types/mirrorz";
import CircleIcon from "@mui/icons-material/Circle";
import { height } from "@mui/system";

export default (props: { queryItem: Mirror }) => {
  const generateStatusCircle = () => {
    const statusString: string = props.queryItem.status;
    const statusInfo: statusInfo = getStatusInfo(statusString);
    console.log(statusInfo);
    return (
      <Grid
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="baseline"
        spacing={0.5}
      >
        <Grid item>
          <CircleIcon sx={{ fontSize: 8 }} color={statusInfo.color} />
        </Grid>
        <Grid item>
          <Typography
            variant="body2"
            component="div"
            color={`${statusInfo.color}.main`}
            fontWeight={500}
            fontSize={12}
          >
            {statusInfo.content.toUpperCase()}
          </Typography>
        </Grid>
      </Grid>
    );
  };

  return (
    <Card className="zju-mirror-card" style={{ height: "100%" }}>
      <CardActionArea
        onClick={() => navigate(`/info?name=${props.queryItem.cname}`)}
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
                {props.queryItem.cname}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {props.queryItem.desc}
              </Typography>
            </Grid>
            <Grid item>{generateStatusCircle()}</Grid>
          </Grid>
      </CardActionArea>
    </Card>
  );
};

export type statusInfo = {
  content: string;
  color:
    | "inherit"
    | "disabled"
    | "action"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning";
};

export const getStatusInfo = (statusString: string): statusInfo => {
  const status = statusString?.at(0);
  return status === "S"
    ? {
        content: "success",
        color: "success",
      }
    : status === "Y"
    ? {
        content: "syncing",
        color: "warning",
      }
    : status === "F"
    ? {
        content: "failed",
        color: "error",
      }
    : status === "P"
    ? {
        content: "paused",
        color: "warning",
      }
    : status === "C"
    ? {
        content: "cached",
        color: "info",
      }
    : {
        content: "unknown",
        color: "warning",
      };
};
