import CssBaseline from '@mui/material/CssBaseline';
import Viewport from 'gatsby-theme-material-ui-top-layout/src/components/viewport';
import React from 'react';
import { ThemeProvider } from '../components/theme-context';
import { PrefsProvider } from '../components/preferences-context';

export default function wrapWithProvider({
  element,
}: {
  element: React.ReactNode;
}) {
  return (
    <React.StrictMode>
      <Viewport />
      <PrefsProvider>
        <ThemeProvider>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          {element}
        </ThemeProvider>
      </PrefsProvider>
    </React.StrictMode>
  );
}
