import CssBaseline from '@mui/material/CssBaseline';
import Viewport from 'gatsby-theme-material-ui-top-layout/src/components/viewport';
import React, { Children } from 'react';
import { ThemeProvider } from '../components/theme-context';
import Footer from '../components/footer';


export default function wrapWithProvider({ element }) {
  return (
    <React.StrictMode>
      <Viewport />
      <ThemeProvider>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        {element}
      </ThemeProvider>
    </React.StrictMode>
  );
}
