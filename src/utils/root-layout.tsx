import React from 'react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '../components/theme-context';
import { PrefsProvider } from '../components/preferences-context';

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <React.StrictMode>
      <PrefsProvider>
        <ThemeProvider>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </PrefsProvider>
    </React.StrictMode>
  );
};

export default RootLayout;
