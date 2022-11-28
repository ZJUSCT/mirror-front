import { PaletteMode, ThemeOptions } from '@mui/material';

export default function configTheme(mode: PaletteMode): ThemeOptions {
  return {
    palette:
      mode === 'light'
        ? {
            primary: {
              main: '#157684',
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
              light: '#15BBC6',
            },
            error: {
              main: '#e44918',
            },
            background: {
              default: '#f2f7f9',
            },
          }
        : {
            primary: {
              main: '#15BBC6',
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
              light: '#15BBC6',
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
