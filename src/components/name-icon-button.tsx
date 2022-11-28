import InfoIcon from '@mui/icons-material/Info';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Tooltip } from '@mui/material';
import { IconButton } from 'gatsby-theme-material-ui';
import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { usePrefs } from './preferences-context';

const nameMode = {
  friendly: {
    name: '显示镜像目录名称',
    icon: InfoIcon,
  },
  raw: {
    name: '显示镜像名称',
    icon: InfoOutlinedIcon,
  },
};

const getModeName = (m: boolean): string => (m ? 'friendly' : 'raw');

export default () => {
  const { t } = useTranslation();

  const [prefs, setPrefs] = usePrefs();
  const modeName = getModeName(prefs.friendlyName);
  const mode = modeName === 'friendly' ? nameMode.friendly : nameMode.raw;
  const toggle = () => {
    setPrefs({
      ...prefs,
      friendlyName: !prefs.friendlyName,
    });
  };

  return (
    <Tooltip title={t(mode.name)}>
      <IconButton
        aria-label="toggle friendly name"
        color="primary"
        onClick={toggle}
      >
        <mode.icon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};
