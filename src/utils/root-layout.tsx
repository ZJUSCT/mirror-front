import React from "react";
import { ThemeProvider } from "../components/theme-context";
import { CssBaseline } from "@mui/material";
import { PrefsProvider } from "../components/preferences-context";

export default function RootLayout({ children } : {
  children: React.ReactNode;
}) {
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
}
