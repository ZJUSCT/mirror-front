import TranslateIcon from '@mui/icons-material/Translate';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ToolTip from '@mui/material/Tooltip';
import { useI18next, useTranslation } from 'gatsby-plugin-react-i18next';
import React from 'react';
import { Link } from '../utils/i18n-link';
import '@formatjs/intl-displaynames/polyfill';
import '@formatjs/intl-displaynames/locale-data/en';
import '@formatjs/intl-displaynames/locale-data/zh';

function languageName(lang: string) {
  const { language } = useI18next();
  const origName = new Intl.DisplayNames([lang], { type: 'language' }).of(lang);
  const name = new Intl.DisplayNames([language], { type: 'language' }).of(lang);
  return origName === name ? origName : `${origName} (${name})`;
}

export default () => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const { languages, originalPath } = useI18next();

  return (
    <>
      <ToolTip title={t('语言')}>
        <IconButton
          aria-label="switch languages"
          color="primary"
          onClick={e => setAnchorEl(e.currentTarget)}
        >
          <TranslateIcon fontSize="small" />
        </IconButton>
      </ToolTip>

      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {languages.map(lng => (
          <Link
            key={lng}
            to={originalPath}
            language={lng}
            color="inherit"
            underline="none"
          >
            <MenuItem dense>{languageName(lng)}</MenuItem>
          </Link>
        ))}
      </Menu>
    </>
  );
};
