import Excel from "exceljs";
import { FullParseResult, ParseResult } from "./model";
import { format, isValid, parse } from "date-fns";
import { convertAbbreviatedNumber } from "./utils";

type SheetName = keyof Omit<ParseResult, "info">;
const sheets: SheetName[] = ["viewers", "subscribers"];

export const generateExcelFiles = (parsedData: FullParseResult) => {
  const workbook = new Excel.Workbook();
  sheets.map((name) => {
    const worksheet = createWorksheet(workbook, name);
    Object.entries(parsedData).map(([channel, data], index) => {
      const currentCellIndex = index + (index + 1);
      createHeaderRows(worksheet, channel, currentCellIndex);
      setValuesToSheet(worksheet, data[name], currentCellIndex);
    });
    mergeHeaderCells(worksheet.getRow(1));
  });
  createStatisticWorkSheet(workbook, parsedData);
  return workbook;
};

function createWorksheet(workbook: Excel.Workbook, workSheetName: string) {
  return workbook.addWorksheet(workSheetName, {
    properties: { defaultColWidth: 15 },
  });
}

function createHeaderRows(
  worksheet: Excel.Worksheet,
  name: string,
  currentCellIndex: number
) {
  const nextCellIndex = currentCellIndex + 1;

  const headerCell = worksheet.getRow(1).getCell(currentCellIndex);
  const [dateHeaderCell, valueHeaderCell] = [
    worksheet.getRow(2).getCell(currentCellIndex),
    worksheet.getRow(2).getCell(nextCellIndex),
  ];
  dateHeaderCell.value = "Date";
  valueHeaderCell.value = "Value";
  headerCell.value = name;
}

function mergeHeaderCells(row: Excel.Row) {
  const cellCount = row.cellCount;

  // ExcelJS doesnt have index 0, so we need to start from 1
  // Every step we merge current cell with next cell, so we need to jump over one cell every time (cell = cell + 2)
  for (let cell = 1; cell <= cellCount; cell = cell + 2) {
    row.worksheet.mergeCells(1, cell, 1, cell + 1);
  }
}

function setValuesToSheet(
  worksheet: Excel.Worksheet,
  data: Array<[number, number]>,
  cellIndex: number
) {
  const startRowIndex = 3;
  data?.map(([date, value], index) => {
    const dataRow = worksheet.getRow(index + startRowIndex);
    const [dateCell, valueCell] = [
      dataRow.getCell(cellIndex),
      dataRow.getCell(cellIndex + 1),
    ];
    dateCell.value = format(date, "dd.MM.yyyy");
    valueCell.value = value;
  });
}

function createStatisticWorkSheet(
  workbook: Excel.Workbook,
  parserData: FullParseResult
) {
  const worksheet = workbook.addWorksheet("Statistic", {
    properties: { defaultColWidth: 30 },
  });
  worksheet.columns = [
    { key: "channel_name", header: "Channel Name" },
    { key: "id", header: "Channel ID" },
    { key: "uploads", header: "Uploads" },
    { key: "subscribers", header: "Subscribers" },
    { key: "country", header: "Country" },
    { key: "type", header: "Channel Type" },
    { key: "created", header: "User Created" },
  ];

  const rows = Object.values(parserData).map(({ info }) => {
    const parsedDate = parse(info.created, "MMM do, yyyy", new Date());
    return {
      ...info,
      created: isValid(parsedDate)
        ? format(parsedDate, "dd.MM.yyyy")
        : "Invalid Date",
      subscribers: convertAbbreviatedNumber(info.subscribers),
    };
  });
  worksheet.addRows(rows);
}
