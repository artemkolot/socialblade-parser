import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { ipcRenderer } from "electron";
import { PARSE_EVENTS, PROCESS_STATUS } from "../../../main/model";

const DownloadButton = () => {
  const [disabled, setDisabled] = useState<boolean>(true);

  useEffect(() => {
    ipcRenderer.on(PARSE_EVENTS.STATUS, (_, status) => {
      if (status === PROCESS_STATUS.FINISHED) {
        setDisabled(false);
      }
    });

    ipcRenderer.on(PARSE_EVENTS.STATUS, (_, status) => {
      if (status === PROCESS_STATUS.ABORDTED) {
        setDisabled(true);
      }
    });

    ipcRenderer.on(PARSE_EVENTS.START, () => {
      setDisabled(true);
    });
  }, []);

  const handleClick = () => {
    ipcRenderer.send("download", null);
  };

  return (
    <span>
      <Button
        onClick={handleClick}
        disabled={disabled}
        variant="contained"
        color="success"
        size="small"
        sx={{ fontSize: 13 }}
        endIcon={<FileDownloadIcon />}
      >
        Download
      </Button>
    </span>
  );
};

export default DownloadButton;
