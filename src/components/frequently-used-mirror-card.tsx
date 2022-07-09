import {
  Box, Card,
  CardContent, Grid, Typography
} from "@mui/material";
import { CardActionArea } from "gatsby-theme-material-ui";
import * as React from "react";


export type mirrorBrief = {
  name: string;
  img: React.ReactNode;
  desc: string;
};

export interface FrequentlyUsedMirrorCardProps {
  name: string;
  icon: React.ReactNode;
  desc: string;
  url: string;
}

export default function FrequentlyUsedMirrorCard({ name, icon, desc, url }: FrequentlyUsedMirrorCardProps) {
  return (
    <Card className="zju-mirror-card" style={{ height: "100%" }}>
      <CardActionArea to={url} style={{ height: "100%" }}>
        <Grid
          container
          direction="column"
          justifyContent="flex-start"
          alignItems="center"
        >
          <Box sx={{ pt: 4 }}>{icon}</Box>
          <CardContent>
            <Grid
              container
              direction="column"
              justifyContent="flex-start"
              alignItems="center"
            >
              <Typography variant="h6" component="div" textAlign="center">
                {name}
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                {desc}
              </Typography>
            </Grid>
          </CardContent>
        </Grid>
      </CardActionArea>
    </Card>
  )
};
