import * as React from "react";
import {
  Chip,
  Grid,
  Box,
  Card,
  CardContent,
  Typography,
  CardActionArea,
} from "@mui/material";
import { navigate } from "gatsby";
import type { Mirror } from "../types/mirrorz";
import CircleIcon from "@mui/icons-material/Circle";

export default (props: { queryItem: Mirror }) => {
  const generateStatusCircle = () => {
    const statusString: string = props.queryItem.status;
    let content: string;
    let color: "inherit" | "disabled" | "action" | "primary" | "secondary" | "error" | "info" | "success" | "warning"
    switch (statusString[0]) {
      case "S":
        content = "success";
        color = "success";
        break;
      case "Y":
        content = "syncing";
        color = "warning";
        break;
      case "F":
        content = "failed";
        color = "error";
        break;
      case "P":
        content = "paused";
        color = "warning";
        break;
      case "C":
        content = "cached";
        color = "info";
        break;
      default:
        content = "unknown";
        color = "warning";
    }
    return (
      <Grid
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="baseline"
        spacing={0.5}
      >
        <Grid item>
          <CircleIcon sx={{ fontSize: 8 }} color={color} />
        </Grid>
        <Grid item>
          <Typography variant="body2" component="div" color={`${color}.main`} fontWeight={500} fontSize={12}>
            {content.toUpperCase()}
          </Typography>
        </Grid>
      </Grid>
    );
  };

  return (
    <Card className="zju-mirror-card">
      <CardActionArea
        onClick={() => navigate(`/info?name=${props.queryItem.cname}`)}
      >
        <CardContent>
          <Typography variant="h6" component="div">
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
