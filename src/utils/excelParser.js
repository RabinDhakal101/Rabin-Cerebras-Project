import * as XLSX from "xlsx";
import { parseFilename } from "./filenameParser";

function countNonEmptyCells(row) {
  return row.filter(
    (cell) => cell !== null && cell !== undefined && String(cell).trim() !== ""
  ).length;
}

function findHeaderRowIndex(rawRows) {
  let bestIndex = 0;
  let bestCount = 0;

  rawRows.slice(0, 20).forEach((row, index) => {
    const count = countNonEmptyCells(row);

    if (count > bestCount) {
      bestCount = count;
      bestIndex = index;
    }
  });

  return bestIndex;
}

function normalizeHeader(header, index) {
  if (header === null || header === undefined || String(header).trim() === "") {
    return `Column ${index + 1}`;
  }

  return String(header).trim();
}

function rowsFromSheet(sheet) {
  const rawRows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: null,
    raw: false,
  });

  if (!rawRows.length) {
    return [];
  }

  const headerRowIndex = findHeaderRowIndex(rawRows);
  const headers = rawRows[headerRowIndex].map(normalizeHeader);
  const dataRows = rawRows.slice(headerRowIndex + 1);

  return dataRows
    .filter((row) => countNonEmptyCells(row) > 0)
    .map((row) => {
      const record = {};

      headers.forEach((header, index) => {
        record[header] = row[index] ?? null;
      });

      return record;
    });
}

export async function parseExcelFiles(files) {
  const allRows = [];
  const fileSummaries = [];
  const errors = [];

  for (const file of files) {
    try {
      const buffer = await file.arrayBuffer();

      const workbook = XLSX.read(buffer, {
        type: "array",
        cellDates: true,
      });

      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        errors.push({
          fileName: file.name,
          message: "No sheets found in this Excel file.",
        });
        continue;
      }

      const sheet = workbook.Sheets[sheetName];
      const rows = rowsFromSheet(sheet);
      const fileInfo = parseFilename(file.name);

      console.log("File:", file.name);
      console.log("Sheet:", sheetName);
      console.log("Rows:", rows);
      console.log("Columns:", rows[0] ? Object.keys(rows[0]) : []);

      const parsedRows = rows.map((row, index) => ({
        id: `${file.name}-${index}`,
        sourceFile: file.name,
        sheetName,
        rowNumber: index + 1,
        ...fileInfo,
        ...row,
      }));

      allRows.push(...parsedRows);

      fileSummaries.push({
        fileName: file.name,
        sheetName,
        rowCount: parsedRows.length,
        ...fileInfo,
      });
    } catch (error) {
      errors.push({
        fileName: file.name,
        message: error.message || "Could not parse this Excel file.",
      });
    }
  }

  return {
    rows: allRows,
    fileSummaries,
    errors,
  };
}