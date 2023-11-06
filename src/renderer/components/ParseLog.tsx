import {
  Card,
  CardContent,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  styled,
} from "@mui/material";
import { ipcRenderer } from "electron";
import React, { FC, useEffect, useState } from "react";
import { PARSE_EVENTS } from "../../main/model";

const SmallTableCell = styled(TableCell)({
  fontSize: 12,
});

const ParseLog = () => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    ipcRenderer.on(PARSE_EVENTS.START, () => {
      setLogs([]);
    });

    ipcRenderer.on(PARSE_EVENTS.LOG, (_, data) => {
      setLogs((prev) => [data, ...prev]);
    });
  }, []);

  return (
    <Card>
      <CardContent>
        <TableContainer
          sx={{ maxHeight: "300px", overflowY: "auto" }}
          component={Paper}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <SmallTableCell>Channel</SmallTableCell>
                <SmallTableCell>Viewers</SmallTableCell>
                <SmallTableCell>Subscribes</SmallTableCell>
                <SmallTableCell>Statistics</SmallTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs?.map((log, index) => {
                return (
                  <TableRow sx={{ fontSize: 10 }} key={"error" + index}>
                    <SmallTableCell>{log.channel}</SmallTableCell>
                    {Object.entries(log.data).map(([key, value], i) => {
                      return (
                        <LogTableCell
                          key={"tablecell-" + i}
                          value={value}
                        ></LogTableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export const LogTableCell: FC<{ value: any | Error }> = ({ value }) => {
  return (
    <SmallTableCell>
      {value instanceof Error ? (
        <Typography variant="caption" color="crimson">
          <>{value.message || value}</>
        </Typography>
      ) : (
        <Typography variant="caption" color="greenyellow">
          <>Success</>
        </Typography>
      )}
    </SmallTableCell>
  );
};

export default ParseLog;
