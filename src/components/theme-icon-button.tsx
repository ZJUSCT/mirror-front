import Brightness4Icon from '@mui/icons-material/Brightness4';
import BrightnessAutoIcon from '@mui/icons-material/BrightnessAuto';
import BrightnessHighIcon from '@mui/icons-material/BrightnessHigh';
import ToolTip from '@mui/material/Tooltip';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { LinkIconButton as IconButton } from './link-mui-components';
import { ThemeMode, useMode } from './theme-context';

export default () => {
  const { t } = useTranslation();

  const modeMap = {
    light: {
      name: t('浅色'),
      icon: BrightnessHighIcon,
    },
    dark: {
      name: t('深色'),
      icon: Brightness4Icon,
    },
    auto: {
      name: t('系统默认'),
      icon: BrightnessAutoIcon,
    },
  };

  const [mode, setMode] = useMode() ?? ['auto', () => {}];
  const currentMode = modeMap[mode];
  const Icon = currentMode.icon;

  const toggleMode = () => {
    const nextModes: Record<ThemeMode, ThemeMode> = {
      light: 'dark',
      dark: 'auto',
      auto: 'light',
    };
    setMode(nextModes[mode]);
  };

  return (
    <ToolTip title={currentMode.name}>
      <IconButton
        aria-label="toggle theme"
        color="primary"
        onClick={toggleMode}
      >
        <Icon fontSize="small" />
      </IconButton>
    </ToolTip>
  );
};
