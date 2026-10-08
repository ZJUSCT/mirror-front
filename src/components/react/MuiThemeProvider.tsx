import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

type ThemeMode = 'light' | 'dark';

interface SiteThemeSnapshot {
  mode: ThemeMode;
  background: string;
  surface: string;
  text: string;
  muted: string;
  primary: string;
  secondary: string;
  border: string;
  radius: number;
}

const initialTheme: SiteThemeSnapshot = {
  mode: 'light',
  background: '#f0f3f8',
  surface: '#ffffff',
  text: 'rgba(0, 0, 0, 0.87)',
  muted: 'rgba(0, 0, 0, 0.6)',
  primary: '#154a87',
  secondary: '#6780da',
  border: 'rgba(0, 0, 0, 0.12)',
  radius: 4,
};

function activeSiteTheme(): SiteThemeSnapshot {
  const root = document.documentElement;
  const styles = getComputedStyle(root);
  const color = (name: string, fallback: string) =>
    styles.getPropertyValue(name).trim() || fallback;
  return {
    mode: root.dataset.theme === 'dark' ? 'dark' : 'light',
    background: color('--background', initialTheme.background),
    surface: color('--surface', initialTheme.surface),
    text: color('--text', initialTheme.text),
    muted: color('--muted', initialTheme.muted),
    primary: color('--primary', initialTheme.primary),
    secondary: color('--info', initialTheme.secondary),
    border: color('--border', initialTheme.border),
    radius:
      Number.parseFloat(styles.getPropertyValue('--radius')) ||
      initialTheme.radius,
  };
}

export default function MuiThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Keep the server and first client render deterministic, then follow the
  // effective site theme maintained on the root element.
  const [siteTheme, setSiteTheme] = useState(initialTheme);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setSiteTheme(activeSiteTheme());
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-theme', 'data-site-theme'],
    });
    return () => observer.disconnect();
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: siteTheme.mode,
          primary: { main: siteTheme.primary },
          secondary: { main: siteTheme.secondary },
          background: {
            default: siteTheme.background,
            paper: siteTheme.surface,
          },
          text: { primary: siteTheme.text, secondary: siteTheme.muted },
          divider: siteTheme.border,
        },
        shape: { borderRadius: siteTheme.radius },
        typography: {
          fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
          button: { textTransform: 'none' },
        },
      }),
    [siteTheme]
  );

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
