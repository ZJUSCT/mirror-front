import { PaletteMode, ThemeOptions, createTheme } from '@mui/material';
import '@fontsource/poppins';

function configTheme(mode: PaletteMode): ThemeOptions {
  return {
    palette:
      mode === 'light'
        ? {
            mode,
            primary: {
              main: '#154A87',
            },
            neutral: {
              main: '#f2f7f9',
            },
            success: {
              main: '#27a881',
            },
            warning: {
              main: '#37adc7',
            },
            info: {
              main: '#6780da',
              light: '#63a0cf;',
            },
            error: {
              main: '#e44918',
            },
            background: {
              default: '#F0F3F8',
            },
          }
        : {
            mode,
            primary: {
              main: '#1d69b5',
            },
            neutral: {
              main: '#070707',
            },
            success: {
              main: '#27a881',
            },
            warning: {
              main: '#37adc7',
            },
            info: {
              main: '#6780da',
              light: '#63a0cf;',
            },
            error: {
              main: '#e44918',
            },
            background: {
              default: '#070707',
              paper: '#161718',
            },
          },
    typography: {
      h1: {
        fontFamily: '"Poppins", sans-serif',
        fontWeight: 700,
      },
      h2: {
        fontFamily: '"Metropolis", sans-serif',
        fontWeight: 700,
      },
      h3: {
        fontFamily: '"Metropolis", sans-serif',
        fontWeight: 700,
      },
      h5: {
        fontFamily: '"Metropolis", sans-serif',
        fontWeight: 700,
      },
      h6: {
        fontFamily: '"Metropolis", sans-serif',
        fontWeight: 700,
      },
      subtitle1: {
        fontFamily: '"Metropolis", sans-serif',
        fontWeight: 700,
      },
      subtitle2: {
        fontFamily: '"Metropolis", sans-serif',
        fontWeight: 700,
      },
    },
  };
}

export const lightTheme = createTheme({
  ...configTheme('light'),
  cssVariables: { colorSchemeSelector: 'data' },
});

export const darkTheme = createTheme({
  ...configTheme('dark'),
  cssVariables: { colorSchemeSelector: 'data' },
});

/* the code below decares customized color */

declare module '@mui/material/styles' {
  interface Palette {
    neutral: Palette['primary'];
  }

  // allow configuration using `createTheme`
  interface PaletteOptions {
    neutral?: PaletteOptions['primary'];
  }
}

// Update the Button"s color prop options
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    neutral: true;
  }
}
