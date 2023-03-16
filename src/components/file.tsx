import React from 'react';
import { Card, Grid, Typography } from '@mui/material';
import AlbumIcon from '@mui/icons-material/Album';
import { Trans } from 'gatsby-plugin-react-i18next';
import { CardActionArea } from 'gatsby-theme-material-ui';

export interface FileProps {
  name: string;
  url: string;
}

export default ({ name, url }: FileProps) => {
  return (
    <Card className="zju-mirror-card" style={{ height: '100%' }}>
      <CardActionArea to={url} sx={{ p: 2 }}>
        <Grid
          container
          direction="row"
          justifyContent="flex-start"
          alignItems="stretch"
          spacing={1}
        >
          <Grid item height="0px">
            <AlbumIcon color="primary" />
          </Grid>
          <Grid item>
            <Typography
              variant="subtitle1"
              component="div"
              color="primary"
              lineHeight={1.5}
              fontWeight={400}
            >
              <Trans>ISO</Trans>
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="subtitle1" component="div" lineHeight={1.5}>
              {name}
            </Typography>
          </Grid>
        </Grid>
      </CardActionArea>
    </Card>
  );
};
