import { PaletteMode, ThemeOptions, createTheme } from '@mui/material';
import '@fontsource/poppins';
import {
  grayscale,
  steps,
  lightAccent,
  lightWarn,
  lightSuccess,
  lightInfo,
  lightErr,
  tintedGrayscale,
  darkAccent,
  darkErr,
  darkInfo,
  darkSuccess,
  darkWarn,
  tintLight050,
} from './colors';

function configTheme(mode: PaletteMode): ThemeOptions {
  return {
    palette:
      mode === 'light'
        ? {
            text: {
              primary: grayscale[0],
              secondary: grayscale[12],
              disabled: grayscale[Math.floor(steps * 0.4)],
            },
            primary: {
              main: lightAccent,
            },
            neutral: {
              main: '#f2f7f9',
            },
            success: {
              main: lightSuccess,
            },
            warning: {
              main: lightWarn,
            },
            info: {
              main: lightInfo,
              light: '#63a0cf;',
            },
            error: {
              main: lightErr,
            },
            background: {
              default: tintedGrayscale[steps - 2],
              paper: tintLight050,
            },
          }
        : {
            text: {
              primary: grayscale[steps - 1],
              secondary: tintedGrayscale[steps - 7],
              disabled: tintedGrayscale[Math.ceil(steps * 0.6)],
            },
            primary: {
              main: darkAccent,
            },
            neutral: {
              main: '#070707',
            },
            success: {
              main: darkSuccess,
            },
            warning: {
              main: darkWarn,
            },
            info: {
              main: darkInfo,
              light: '#63a0cf;',
            },
            error: {
              main: darkErr,
            },
            background: {
              default: grayscale[0],
              paper: grayscale[2],
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

export const lightTheme = createTheme(
  {
    palette: {
      mode: 'light',
    },
  },
  configTheme('light')
);

export const darkTheme = createTheme(
  {
    palette: {
      mode: 'dark',
    },
  },
  configTheme('dark')
);

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
