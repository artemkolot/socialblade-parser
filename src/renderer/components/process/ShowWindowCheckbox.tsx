import { Checkbox, FormControlLabel, Typography } from "@mui/material";
import { ipcRenderer } from "electron";
import React, { ChangeEvent, useState } from "react";
import { PARSE_EVENTS } from "../../../main/model";

const ShowWindowCheckbox = () => {
  const [isVisible, setIsVisisble] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsVisisble((prev) => !prev);
    ipcRenderer.send(PARSE_EVENTS.TOGGLE_PARSE_WINDOW, e.target.checked);
  };

  return (
    <FormControlLabel
      control={
        <Checkbox size="small" value={isVisible} onChange={handleChange} />
      }
      label={
        <Typography variant="caption" sx={{ userSelect: "none" }}>
          Show parse window
        </Typography>
      }
    />
  );
};

export default ShowWindowCheckbox;
