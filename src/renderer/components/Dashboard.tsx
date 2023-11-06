import {
  AppBar,
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import { ParseProvider } from "../context/ParseContext";
import ParseLog from "./ParseLog";
import ParsingProcess from "./process";
import DataInputPanel from "./data-input-panel";
import Terminal from "./Terminal";

const Dashboard = () => {
  return (
    <Box>
      <AppBar position="static" color="default">
        <Toolbar variant="dense">
          <Stack direction="row" gap={1}>
            <Typography color="white">SOCIAL</Typography>
            <Typography color="red" fontWeight={600}>
              BLADE
            </Typography>
          </Stack>
        </Toolbar>
      </AppBar>
      <ParseProvider>
        <Grid container padding={2} spacing={2}>
          <Grid item md={4} xs={12}>
            <Card component={Paper}>
              <CardContent sx={{ display: "flex" }}>
                <Stack alignItems="stretch" flexGrow={1}>
                  <DataInputPanel />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs gap={2}>
            <Stack gap={1}>
              <ParsingProcess />
            </Stack>
          </Grid>
          <Grid item xs={12} gap={2}>
            <ParseLog></ParseLog>
          </Grid>
        </Grid>
      </ParseProvider>
    </Box>
  );
};

export default Dashboard;
