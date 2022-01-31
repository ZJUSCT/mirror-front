import * as React from "react";
import {
  Chip,
  Tooltip,
  Card,
  CardContent,
  Typography,
  CardActionArea,
} from "@mui/material";
import { navigate } from "gatsby";
import type { Mirror } from "../types/mirrorz";

export default (props: { queryItem: Mirror }) => {
  const generateStatusCircle = () => {
    const statusString: string = props.queryItem.status;
    let statusCircle: any;
    switch (statusString[0]) {
      case "S":
        statusCircle = <Chip label="success" color="success" size="small" />;
        break;
      case "Y":
        statusCircle = <Chip label="syncing" color="warning" size="small" />;
        break;
      case "F":
        statusCircle = <Chip label="failed" color="error" size="small" />;
        break;
      case "P":
        statusCircle = <Chip label="paused" color="warning" size="small" />;
        break;
      case "C":
        statusCircle = <Chip label="cached" color="info" size="small" />;
        break;
      default:
        statusCircle = <Chip label="unknown" color="warning" size="small" />;
    }
    var timeString: string = statusString.substring(1, 11);
    if (timeString.length !== 0) {
      var timeString = new Date(parseInt(timeString) * 1000).toLocaleString(
        "zh-CN"
      );
      return (
        <Tooltip title={timeString} placement="right">
          {statusCircle}
        </Tooltip>
      );
    } else {
      return statusCircle;
    }
  };

  return (
    <Card className="zju-mirror-card">
      <CardActionArea
        onClick={() => navigate(`/info?name=${props.queryItem.cname}`)}
      >
        <CardContent>
          <Typography gutterBottom variant="h6" component="div">
            {props.queryItem.cname}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {props.queryItem.desc}
          </Typography>
          {generateStatusCircle()}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
