import * as React from "react";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import {
  Chip,
  Tooltip,
  Card,
  Box,
  CardContent,
  Typography,
  CardActionArea,
  IconButton,
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
    <Card sx={{ boxShadow: 6 }}>
      <CardActionArea onClick={() => navigate(props.queryItem.url)}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              bgcolor: "background.paper",
              elevation: 4,
            }}
          >
            <Typography gutterBottom variant="h6" component="div">
              {props.queryItem.cname}
            </Typography>
            {props.queryItem.help === undefined ? (
              <></>
            ) : (
              <IconButton onClick={() => navigate(props.queryItem.help)}>
                <HelpOutlineIcon />
              </IconButton>
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {props.queryItem.desc}
          </Typography>
          {generateStatusCircle()}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
