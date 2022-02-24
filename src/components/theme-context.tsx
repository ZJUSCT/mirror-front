import { PaletteMode } from '@mui/material';
import {
  createTheme, ThemeProvider as MuiThemeProvider
} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';
import configTheme from './config-theme';

export type ThemeMode = PaletteMode | 'auto';

export declare type ThemeContextInterface = [ThemeMode, (mode: ThemeMode) => void];

export const ThemeContext = React.createContext<ThemeContextInterface | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<ThemeMode>('auto');
  const preferredMode = useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light';
  const paletteMode = mode === 'auto' ? preferredMode : mode;

  const theme = React.useMemo(
    () => createTheme({
      palette: {
        mode: paletteMode,
      },
    }, configTheme(paletteMode)),
    [paletteMode]
  );

  React.useEffect(
    () => {
      if (!window) return;
      const mode = window.localStorage.getItem('themeMode') as ThemeMode;
      if (mode) setMode(mode);
    },
    [preferredMode]
  );

  const updateMode = (mode: ThemeMode) => {
    setMode(mode);
    if (!window) return;
    window.localStorage.setItem('themeMode', mode);
  }

  return (
    <MuiThemeProvider theme={theme}>
      <ThemeContext.Provider value={[mode, updateMode]}>{children}</ThemeContext.Provider>
    </MuiThemeProvider>
  );
}

export const useMode = () => React.useContext(ThemeContext);
