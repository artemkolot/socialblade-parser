import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as path from "path";
import * as url from "url";
import MenuBuilder from "./menu";
import {
  executedPromiseFunction,
  handleParsingError,
  sendParserLog,
} from "./parse";
import { calculateProgress, waitTimeout } from "./utils";
import {
  PARSE_EVENTS,
  PROCESS_STATUS,
  ProcessStatus,
  ParseResult,
} from "./model";
import { SocialBlade } from "./targets/socialblade";
import { generateExcelFiles } from "./xlsx";

let mainWindow: Electron.BrowserWindow | null;
let parserWindow: Electron.BrowserWindow | null;
let showParseWindow: boolean = false;
let socialBladeData: SocialBlade;
const maxRetry = 2;
const retryMillisecondsDelay = 3000;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 800,
    backgroundColor: "#f2f2f2",
    webPreferences: {
      zoomFactor: 1,
      nodeIntegration: true,
      contextIsolation: false,
      devTools: process.env.NODE_ENV !== "production",
    },
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:4000");
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, "renderer/index.html"),
        protocol: "file:",
        slashes: true,
      })
    );
  }

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on(PARSE_EVENTS.START, async (_, chanels: string[]) => {
  const parseController = new AbortController();
  const { signal } = parseController;

  ipcMain.once(PARSE_EVENTS.ABORT, () => {
    parseController.abort();
  });

  emitStart();

  try {
    await startParsing(chanels, signal);
  } catch (error: any) {
    console.log(error);
  } finally {
    emitStatus(PROCESS_STATUS.FINISHED);
    parserWindow?.close();
    parserWindow = null;
  }
});

ipcMain.on(PARSE_EVENTS.TOGGLE_PARSE_WINDOW, (_, isVisible) => {
  showParseWindow = isVisible;
  if (parserWindow) {
    if (showParseWindow) {
      parserWindow.show();
    } else {
      parserWindow.hide();
    }
  }
});

ipcMain.on("download", () => {
  downloadFiles();
});

async function startParsing(channels: string[], signal: AbortSignal) {
  parserWindow = new BrowserWindow({
    show: showParseWindow,
  });

  const progressPercent = calculateProgress(channels.length);
  socialBladeData = new SocialBlade();

  for (const channel of channels) {
    if (signal.aborted) {
      throw new Error("Parser stopped");
    }
    const url = socialBladeData.getParseURL(channel);
    emitCurrentUrl(url);

    try {
      await parserWindow.loadURL(url);
      const results = await parseChannelData(socialBladeData);
      prepareResult(channel, results);
      prepareLogs(channel, results);
    } catch (error: any) {
      handleParsingError(channel, error);
    }
    emitProgress(progressPercent());
  }
}

async function downloadFiles() {
  const data = socialBladeData.getResult();
  if (!data || Object.keys(data).length === 0) {
    return;
  }
  const workbook = generateExcelFiles(socialBladeData.getResult());

  dialog
    .showSaveDialog(mainWindow!, {
      title: "Save file",
      defaultPath: __dirname,
      buttonLabel: "Save",
    })
    .then(async ({ filePath }) => {
      if (filePath) {
        await workbook.xlsx.writeFile(filePath + ".xlsx");
      }
    });
}

function prepareResult(channel: string, results: PromiseSettledResult<any>[]) {
  const result = results
    .filter(
      (res): res is PromiseFulfilledResult<any> => res.status === "fulfilled"
    )
    .reduce((prev, curr) => {
      Object.assign(prev, { [curr.value.name]: curr.value.value });
      return prev;
    }, {} as ParseResult);

  if (Object.values(result).length > 0) {
    socialBladeData.setResult({ [`${channel}`]: result });
  }
}

function prepareLogs(channel: string, results: PromiseSettledResult<any>[]) {
  const logData = results.reduce((prev, curr) => {
    if (curr.status === "fulfilled") {
      Object.assign(prev, { [curr.value.name]: curr.value.value });
    } else {
      Object.assign(prev, {
        [curr.reason.name]: curr.reason.error || curr.reason,
      });
    }
    return prev;
  }, {} as ParseResult);

  //Refactor
  if (results.some((val) => val.status === "rejected")) {
    handleParsingError(channel, "Just for count error");
  }
  sendParserLog(channel, logData);
}

async function parseChannelData(parser: SocialBlade) {
  emitStatus(PROCESS_STATUS.PARSING);
  const executeParserFunctions = parser.getParseFunctions();
  return await tryParse(executeParserFunctions);
}

async function tryParse(
  parserFunctions: string | string[],
  maxRetries: number = maxRetry,
  retryDelay: number = retryMillisecondsDelay
): Promise<PromiseSettledResult<any>[]> {
  if (!Array.isArray(parserFunctions)) {
    parserFunctions = [parserFunctions];
  }

  const parsingPromises = parserFunctions.map((parserFunction) =>
    retryWithDelay(maxRetries, retryDelay, () =>
      executeParserFunction(parserFunction)
    )
  );

  return Promise.allSettled(parsingPromises);
}

async function retryWithDelay(
  maxRetries: number,
  retryDelay: number,
  func: () => Promise<any>
) {
  let retryCount = 0;

  while (true) {
    try {
      return await func();
    } catch (error) {
      emitStatus(PROCESS_STATUS.RETRY_PARSING);
      if (retryCount >= maxRetries) {
        throw error;
      }
      retryCount++;
      await waitTimeout(retryDelay);
    }
  }
}

async function executeParserFunction(parserFunction: string) {
  const functionAsString = executedPromiseFunction(parserFunction);
  return await parserWindow?.webContents.executeJavaScript(functionAsString);
}

function emitCurrentUrl(url: string): void {
  mainWindow?.webContents.send(PARSE_EVENTS.CURRENT_URL, url);
}

function emitProgress(progress: number) {
  mainWindow?.webContents.send(PARSE_EVENTS.PROGRESS, progress);
}

function emitStatus(status: ProcessStatus) {
  mainWindow?.webContents.send(PARSE_EVENTS.STATUS, status);
}
function emitStart() {
  mainWindow?.webContents.send(PARSE_EVENTS.START, true);
}
