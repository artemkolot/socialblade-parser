import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import React from "react";
import theme from "../theme";
import Dashboard from "./Dashboard";

export default function App(): JSX.Element {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box>
        <main>
          <Dashboard />
        </main>
      </Box>
    </ThemeProvider>
  );
}
