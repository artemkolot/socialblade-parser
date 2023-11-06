import { styled } from "@mui/system";

import { TextareaAutosize as BaseTextareaAutosize } from "@mui/base";
import { Button, Stack } from "@mui/material";
import React, { ChangeEvent, FC, useState } from "react";
import { useParseContext } from "../../context/ParseContext";
import ParseScriptList from "./ParseScriptList";

const blue = {
  100: "#DAECFF",
  200: "#b6daff",
  400: "#3399FF",
  500: "#007FFF",
  600: "#0072E5",
  900: "#003A75",
};

const grey = {
  50: "#F3F6F9",
  100: "#E5EAF2",
  200: "#DAE2ED",
  300: "#C7D0DD",
  400: "#B0B8C4",
  500: "#9DA8B7",
  600: "#6B7A90",
  700: "#434D5B",
  800: "#303740",
  900: "#1C2025",
};

const StyledTextarea = styled(BaseTextareaAutosize)(
  ({ theme }) => `
      font-family: IBM Plex Sans, sans-serif;
      font-size: 0.850rem;
      font-weight: 400;
      line-height: 1.5;
      padding: 8px 12px;
      border-radius: 8px;
      color: ${grey[300]};
      background: ${grey[900]};
      border: 1px solid ${grey[700]};
      box-shadow: 0px 2px 2px ${grey[900]};
      resize: vertical;
      width: 100%;
      &:hover {
        border-color: ${blue[400]};
      }
  
      &:focus {
        border-color: ${blue[400]};
        box-shadow: 0 0 0 1px ${blue[600]};
      }
  
      // firefox
      &:focus-visible {
        outline: 0;
      }
    `
);

const DataInputPanel: FC<any> = () => {
  const [text, setText] = useState<string>();
  const { dispatch } = useParseContext();

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value: string = e.target.value;
    setText(value);
    setChannelsAsArray(value);
  };

  const setChannelsAsArray = (channelsAsString: string) => {
    const preparedChannels = channelsAsString
      .split("\n")
      .filter((chanel) => chanel !== "");
    const mappedChannels = preparedChannels.map((chanel) =>
      chanel.replace(/["',", ' ']/g, "")
    );
    dispatch({ type: "SET_CHANNELS", payload: mappedChannels });
  };

  const resetChanels = () => {
    setText("");
    dispatch({ type: "SET_CHANNELS", payload: [] });
  };

  return (
    <>
      <StyledTextarea
        value={text}
        onChange={handleChange}
        minRows={10}
        maxRows={10}
        style={{ overflowY: "auto" }}
        placeholder="One per row..."
      />
      <Stack
        marginTop={1}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Stack direction="row" gap={2} flexWrap="wrap"></Stack>
      </Stack>
    </>
  );
};

export default DataInputPanel;
