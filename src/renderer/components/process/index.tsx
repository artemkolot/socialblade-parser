import {
  Box,
  Card,
  CardContent,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  linearProgressClasses,
} from "@mui/material";
import { styled } from "@mui/system";
import React, { FC } from "react";
import { useParseContext } from "../../context/ParseContext";
import ProcessButton from "./ProcessButton";
import ShowWindowCheckbox from "./ShowWindowCheckbox";
import DownloadButton from "./DownloadButton";

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  margin: "0.5rem 0",
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: "greenyellow",
    animationDuration: "1.5s",
  },
}));

const InfoBlock: FC<{ children: any; color?: any }> = ({
  children,
  ...params
}) => {
  return (
    <Typography variant="caption" {...params}>
      {children}
    </Typography>
  );
};

const ParsingProcess = () => {
  const { state } = useParseContext();

  return (
    <>
      <Card component={Paper}>
        <CardContent>
          <Stack>
            <InfoBlock>
              <Stack direction="row" gap={0.5}>
                <Box>Current URL:</Box>
                <Box>{state?.currentUrl}</Box>
              </Stack>
            </InfoBlock>
            <InfoBlock>
              <Stack direction="row" gap={0.5}>
                <Box>Current Status:</Box>
                <Box textTransform="capitalize">{state?.status}</Box>
              </Stack>
            </InfoBlock>
          </Stack>
          <BorderLinearProgress variant="determinate" value={state?.progress} />
          <Stack>
            <InfoBlock color="greenyellow">
              <Stack direction="row" gap={0.5}>
                <Box>Complete:</Box>
                <Box textTransform="capitalize">{state?.progress}%</Box>
              </Stack>
            </InfoBlock>
            <InfoBlock>
              <Stack direction="row" gap={0.5}>
                <Box>Total count:</Box>
                <Box textTransform="capitalize">{state?.channels.length}</Box>
              </Stack>
            </InfoBlock>
            <InfoBlock color="error">
              <Stack direction="row" gap={0.5}>
                <Box>Failed:</Box>
                <Box textTransform="capitalize">{state?.errors?.length}</Box>
              </Stack>
            </InfoBlock>
          </Stack>
        </CardContent>
      </Card>
      <Stack direction="row" justifyContent="space-between" gap={2}>
        <ShowWindowCheckbox />
        <Stack direction="row" alignItems="center" gap={2}>
          <DownloadButton />
          <ProcessButton />
        </Stack>
      </Stack>
    </>
  );
};

export default ParsingProcess;
