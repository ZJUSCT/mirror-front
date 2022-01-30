import * as React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Grid,
} from "@mui/material";
import { Info } from "@mui/icons-material";

export type mirrorBrief = {
  name: string;
  img: React.ReactNode;
  desc: string;
};

export default (props: { info: mirrorBrief }) => (
  <Card sx={{ maxWidth: 345, boxShadow: 6 }}>
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
  </Card>
);
