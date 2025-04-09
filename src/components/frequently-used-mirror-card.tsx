import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { LinkCardActionArea as CardActionArea } from './link-mui-components';

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

export default ({ name, icon, desc, url }: FrequentlyUsedMirrorCardProps) => {
  return (
    <Card className="zju-mirror-card" style={{ height: '100%' }}>
      <CardActionArea
        to={url}
        href={url}
        onClick={e => e.preventDefault()}
        style={{ height: '100%' }}
      >
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
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                {desc}
              </Typography>
            </Grid>
          </CardContent>
        </Grid>
      </CardActionArea>
    </Card>
  );
};
