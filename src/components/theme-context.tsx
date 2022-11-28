import { PaletteMode } from '@mui/material';
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';
import configTheme from './config-theme';
import { readCache, writeCache } from '../utils/cache';

export type ThemeMode = PaletteMode | 'auto';

export declare type ThemeContextInterface = [
  ThemeMode,
  (mode: ThemeMode) => void
];

export const ThemeContext = React.createContext<ThemeContextInterface | null>(
  null
);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // bypass gatsby build
  if (typeof window === 'undefined') return <div />;

  const savedMode = readCache('themeMode', 'auto' as ThemeMode);
  const [mode, setMode] = React.useState<ThemeMode>(savedMode);

  let paletteMode: PaletteMode;
  if (mode === 'auto') {
    // wait for media query result stable
    // ref: https://github.com/mui/material-ui/issues/15588#issuecomment-567803082
    const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
    const prefersLight = useMediaQuery('(prefers-color-scheme: light)');
    if (prefersDark !== !prefersLight) return null;
    const preferredMode = prefersDark ? 'dark' : 'light';
    paletteMode = preferredMode;
  } else {
    paletteMode = mode;
  }

  const theme = React.useMemo(
    () =>
      createTheme(
        {
          palette: {
            mode: paletteMode,
          },
        },
        configTheme(paletteMode)
      ),
    [paletteMode]
  );

  const updateMode = (newMode: ThemeMode) => {
    setMode(newMode);
    writeCache('themeMode', newMode);
  };
  return (
    <MuiThemeProvider theme={theme}>
      <ThemeContext.Provider value={[mode, updateMode]}>
        {children}
      </ThemeContext.Provider>
    </MuiThemeProvider>
  );
};

export const useMode = () => React.useContext(ThemeContext);
