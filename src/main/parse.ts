import { PARSE_EVENTS, ParseResult } from "./model";

const electronBrowserWindow = require("electron").BrowserWindow;
export const PARSE_KEYS = {
  MONTHLY_GAINED_VIEWS: {
    name: "views",
    trigger: "Monthly Gained Video Views",
  },
  MONTHLY_GAINED_SUBSCRIBERS: {
    name: "subscribers",
    trigger: "Monthly Gained Subscribers",
  },
};

export const executedPromiseFunction = (parseFunction: string) => {
  return `new Promise((resolve, reject) => {
    ${parseFunction}
  })`;
};

export function handleParsingError(channel: string, error: any) {
  const errorMessage = error.message || error;
  const mainWindow = electronBrowserWindow.fromId(1);
  mainWindow?.webContents.send(PARSE_EVENTS.ERROR, {
    channel,
    error: errorMessage,
  });
}

export function sendParserLog(channel: string, data: ParseResult) {
  const mainWindow = electronBrowserWindow.fromId(1);
  mainWindow?.webContents.send(PARSE_EVENTS.LOG, {
    channel,
    data,
  });
}
