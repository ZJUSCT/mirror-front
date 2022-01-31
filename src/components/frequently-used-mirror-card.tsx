import * as React from "react";
import { navigate } from "gatsby";
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
  Grid,
} from "@mui/material";

export type mirrorBrief = {
  name: string;
  img: React.ReactNode;
  desc: string;
};

export default (props: { info: mirrorBrief }) => (
  <Card sx={{ boxShadow: "0rem 0.2rem 0.4rem #00000020" }}>
    <CardActionArea
      onClick={() => navigate(`/info?name=${props.info.name}`)}
    >
      <Grid
        container
        direction="column"
        justifyContent="flex-start"
        alignItems="center"
      >
        <Box sx={{ pt: 4 }}>{props.info.img}</Box>
        <CardContent>
          <Grid
            container
            direction="column"
            justifyContent="flex-start"
            alignItems="center"
          >
            <Typography variant="h6" component="div">
              {props.info.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {props.info.desc}
            </Typography>
          </Grid>
        </CardContent>
      </Grid>
    </CardActionArea>
  </Card>
);
