import { Box, Card, CardContent, Stack } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useParseContext } from "../context/ParseContext";
import { ipcRenderer } from "electron";
import { PARSE_EVENTS } from "../../main/model";
import { channel } from "diagnostics_channel";
const Terminal = () => {
  const { state } = useParseContext();
  const [errors, setErrors] = useState<any[]>([]);

  useEffect(() => {
    ipcRenderer.on(
      PARSE_EVENTS.LOG,
      (
        _,
        result: {
          channel: string;
          data: { info: any; viewers: any; subscribers: any };
        }
      ) => {
        const someErrors = Object.entries(result.data)
          .filter(([_, parseValue]) => parseValue instanceof Error)
          .map(([parseName, parseValue]) => ({
            channel: result.channel,
            name: parseName,
            errorMsg: parseValue.message,
          }));

        if (someErrors.length > 0) {
          someErrors.forEach((err) => setErrors((prev) => [err, ...prev]));
        }
        console.log(errors);
      }
    );
  }, []);

  return (
    <Box
      margin={2}
      padding={2}
      fontSize={14}
      fontFamily={"monospace"}
      overflow="auto"
      sx={{ backgroundColor: "#151515", height: "200px" }}
    >
      <Stack direction="row">
        <Box color="coral"># [Lorem.]</Box>

        <span>[info]</span>

        <span>Lorem ipsum dolor sit amet.</span>
      </Stack>
      {errors.map(({ channel, name, errorMsg }) => {
        return (
          <Stack direction="row">
            <Box color="HighlightText">[{channel}]</Box>

            <span>[{name}]</span>

            <span>{errorMsg}</span>
          </Stack>
        );
      })}
    </Box>
  );
};

export default Terminal;
