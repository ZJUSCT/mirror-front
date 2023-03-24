import { Card, Grid, Typography, Tooltip } from '@mui/material';
import { useI18next } from 'gatsby-plugin-react-i18next';
import { CardActionArea } from 'gatsby-theme-material-ui';
import * as React from 'react';
import { Locale, Mirror } from '../types/mirror';
import StatusIndicator from './status-indicator';
import { getUrl } from '../utils/url';
import { usePrefs } from './preferences-context';
import VerifiedIcon from '@mui/icons-material/Verified';
import officialCertificatedMirrorList from '../utils/official-certificated-mirror-list';

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
          <Grid item width="100%">
            <Grid
              container
              direction="row"
              flexWrap="nowrap"
              justifyContent="flex-start"
              alignItems="flex-end"
              spacing={1}
            >
              <Grid item>
                <Typography variant="h6" component="div">
                  {prefs.friendlyName
                    ? props.queryItem.name[lang]
                    : props.queryItem.id}
                </Typography>
              </Grid>
              <Grid
                item
                display={
                  officialCertificatedMirrorList.includes(props.queryItem.id)
                    ? 'block'
                    : 'none'
                }
              >
                <Tooltip
                  title={
                    lang === 'zh'
                      ? `已加入 ${props.queryItem.id} 官方镜像列表`
                      : `Added to ${props.queryItem.id} official mirror list`
                  }
                  placement="top"
                >
                  <VerifiedIcon fontSize="small" color="primary" />
                </Tooltip>
              </Grid>
            </Grid>
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
