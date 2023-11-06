import { Button, Tooltip, Zoom } from "@mui/material";
import { ipcRenderer } from "electron";
import React, { useEffect, useState } from "react";
import PauseCircleOutlineOutlinedIcon from "@mui/icons-material/PauseCircleOutlineOutlined";
import PlayCircleFilledWhiteOutlinedIcon from "@mui/icons-material/PlayCircleFilledWhiteOutlined";
import { useParseContext } from "../../context/ParseContext";
import { PARSE_EVENTS, PROCESS_STATUS } from "../../../main/model";
const ProcessButton = () => {
  const {
    state: { status, channels },
  } = useParseContext();

  const [isProcess, setIsProcess] = useState<boolean>(false);

  useEffect(() => {
    if (status === PROCESS_STATUS.FINISHED) {
      setIsProcess(false);
    }
  }, [status]);
  const handleStartParsing = () => {
    ipcRenderer.send(PARSE_EVENTS.START, channels);
    setIsProcess(true);
  };

  const parseAbort = () => {
    ipcRenderer.send(PARSE_EVENTS.ABORT, true);
  };

  return (
    <>
      <Tooltip
        title={channels.length ? "" : "Add channels first"}
        placement="bottom"
        arrow
        disableInteractive
        TransitionComponent={Zoom}
      >
        <span>
          <Button
            variant="contained"
            color={isProcess ? "error" : "primary"}
            size="small"
            disabled={channels.length === 0}
            sx={{
              fontSize: 13,
            }}
            onClick={isProcess ? parseAbort : handleStartParsing}
            endIcon={
              isProcess ? (
                <PauseCircleOutlineOutlinedIcon />
              ) : (
                <PlayCircleFilledWhiteOutlinedIcon />
              )
            }
          >
            {isProcess ? "Stop Parse" : "Start Parse"}
          </Button>
        </span>
      </Tooltip>
    </>
  );
};

export default ProcessButton;
