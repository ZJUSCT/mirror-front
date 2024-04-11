import React from 'react';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import AlbumIcon from '@mui/icons-material/Album';
import { Trans } from 'gatsby-plugin-react-i18next';
import { LinkCardActionArea as CardActionArea } from './link-mui-components';

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
