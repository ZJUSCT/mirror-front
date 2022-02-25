import Brightness4Icon from '@mui/icons-material/Brightness4';
import BrightnessAutoIcon from '@mui/icons-material/BrightnessAuto';
import BrightnessHighIcon from '@mui/icons-material/BrightnessHigh';
import ToolTip from '@mui/material/Tooltip';
import { IconButton } from 'gatsby-theme-material-ui';
import React from 'react';
import { ThemeMode, useMode } from './theme-context';

export default function ThemeIconButton() {
  const modeMap = {
    light: {
      name: '浅色',
      icon: BrightnessHighIcon,
    },
    dark: {
      name: '深色',
      icon: Brightness4Icon,
    },
    auto: {
      name: '系统默认',
      icon: BrightnessAutoIcon,
    }
  }

  const [mode, setMode] = useMode();

  const currentMode = modeMap[mode];
  const Icon = currentMode.icon;

  const toggleMode = () => {
    const nextModes: Record<ThemeMode, ThemeMode> = { light: 'dark', dark: 'auto', auto: 'light' };
    setMode(nextModes[mode]);
  };

  return <ToolTip title={currentMode.name}>
    <IconButton
      aria-label="toggle theme"
      color="primary"
      onClick={toggleMode}
    >
      <Icon fontSize='small' />
    </IconButton>
  </ToolTip >
}
