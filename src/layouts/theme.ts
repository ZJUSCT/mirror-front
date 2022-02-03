import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#157684",
    },
    neutral: {
      main: "#f2f7f9",
    },
    success: {
      main: "#27a881"
    },
    warning: {
      main: "#37adc7",
    },
    info: {
      main: "#6780da"
    },
    error: {
      main: "#e44918"
    },
  },
  typography: {
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 1000,
    },
    h6: {
      fontWeight: 1000,
    },
    subtitle1: {
      fontWeight: 1000,
    },
  },
});

/* the code below decares customized color */

declare module "@mui/material/styles" {
  interface Palette {
    neutral: Palette["primary"];
  }

  // allow configuration using `createTheme`
  interface PaletteOptions {
    neutral?: PaletteOptions["primary"];
  }
}

// Update the Button's color prop options
declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    neutral: true;
  }
}
