import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { useI18next } from 'gatsby-plugin-react-i18next';
import * as React from 'react';
import VerifiedIcon from '@mui/icons-material/Verified';
import { LinkCardActionArea as CardActionArea } from './link-mui-components';
import { Locale, Mirror } from '../types/mirror';
import StatusIndicator from './status-indicator';
import { getUrl } from '../utils/url';
import { usePrefs } from './preferences-context';
import officialCertificatedMirrorList from '../utils/official-certificated-mirror-list';

const highlightText = (text: string, keywordString: string) => {
  // If no keywords, just return the original text
  if (!keywordString) return text;

  // Split, trim, dedupe, remove empties
  const keywords = Array.from(
    new Set(
      keywordString
        .split(' ')
        .map(k => k.trim())
        .filter(k => k.length > 0)
    )
  );
  if (keywords.length === 0) return text;

  // Match longest first (handles "foobar" vs "foo"/"bar")
  keywords.sort((a, b) => b.length - a.length);

  const lowerText = text.toLowerCase();

  // Checks for a keyword at `pos`
  const findMatchAt = (pos: number): string | undefined => {
    return keywords.find(kw => lowerText.startsWith(kw.toLowerCase(), pos));
  };

  const result: Array<string | React.JSX.Element> = [];
  let buffer = '';
  let i = 0;

  // Main scan loop
  while (i < text.length) {
    const matchKw = findMatchAt(i);

    if (matchKw) {
      // Flush buffered text
      if (buffer) {
        result.push(buffer);
        buffer = '';
      }

      // Preserve original casing
      const matchedText = text.slice(i, i + matchKw.length);

      // Emit highlight
      result.push(
        <mark key={i} style={{ background: '#fcba03' }}>
          {matchedText}
        </mark> // FIXME: put colour into config file
      );

      i += matchKw.length;
    } else {
      buffer += text[i];
      i += 1;
    }
  }

  // Flush remainder
  if (buffer) result.push(buffer);

  return result;
};

const getCardDisplayName = (
  friendlyName: boolean,
  queryItem: Mirror,
  lang: Locale
): string => (friendlyName ? queryItem.name[lang] : queryItem.id);

const SearchItemCard = (props: { queryItem: Mirror; keyword: string }) => {
  const { language } = useI18next();
  const lang = language as Locale;
  const [prefs, _] = usePrefs();

  return (
    <Card className="zju-mirror-card" style={{ height: '100%' }}>
      <CardActionArea
        component="a"
        to={getUrl(
          props.queryItem.docUrl || props.queryItem.url,
          !!props.queryItem.docUrl
        )}
        href={getUrl(
          props.queryItem.docUrl || props.queryItem.url,
          !!props.queryItem.docUrl
        )}
        onClick={e => e.preventDefault()}
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
          <Grid size={12}>
            <Grid
              container
              direction="row"
              flexWrap="nowrap"
              justifyContent="flex-start"
              alignItems="flex-end"
              spacing={1}
            >
              <Grid>
                <Typography variant="h6" component="div">
                  {highlightText(
                    getCardDisplayName(
                      prefs.friendlyName,
                      props.queryItem,
                      lang
                    ),
                    props.keyword
                  )}
                </Typography>
              </Grid>
              <Grid
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
              {highlightText(props.queryItem.desc[lang], props.keyword)}
            </Typography>
          </Grid>
          <Grid>
            <StatusIndicator status={props.queryItem.status} fontSize={12} />
          </Grid>
        </Grid>
      </CardActionArea>
    </Card>
  );
};

export default SearchItemCard;
