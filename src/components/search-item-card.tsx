import { Card, Grid, Typography } from '@mui/material';
import { useI18next } from 'gatsby-plugin-react-i18next';
import { CardActionArea } from 'gatsby-theme-material-ui';
import * as React from 'react';
import { Locale, Mirror } from '../types/mirror';
import StatusIndicator from './status-indicator';
import { getUrl } from '../utils/url';
import { usePrefs } from './preferences-context';

const SearchItemCard = (props: { queryItem: Mirror }) => {
  const { language } = useI18next();
  const lang = language as Locale;
  const [prefs, _] = usePrefs();

  return (
    <Card className="zju-mirror-card" style={{ height: '100%' }}>
      <CardActionArea
        to={getUrl(
          props.queryItem.docUrl || props.queryItem.url,
          !!props.queryItem.docUrl
        )}
        style={{ height: '100%' }}
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
              {prefs.friendlyName
                ? props.queryItem.name[lang]
                : props.queryItem.id}
            </Typography>
            <Typography gutterBottom variant="body2" color="text.secondary">
              {props.queryItem.desc[lang]}
            </Typography>
          </Grid>
          <Grid item>
            <StatusIndicator status={props.queryItem.status} fontSize={12} />
          </Grid>
        </Grid>
      </CardActionArea>
    </Card>
  );
};

export default SearchItemCard;
