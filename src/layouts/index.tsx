// The component in this file live above the page components
// and persist across page changes. This behavior is controlled
// by 'gatsby-plugin-layout' in 'gatsby-config.js'.

import * as React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme";
import Footer from "../components/footer";

const Layout: React.FC = props => (
  <ThemeProvider theme={theme}>
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>{props.children}</div>
      <Footer />
    </div>
  </ThemeProvider>
);

export default Layout;
