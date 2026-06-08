import * as XLSX from "xlsx";
import { parseFilename } from "./filenameParser";

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

      const rows = XLSX.utils.sheet_to_json(sheet, {
        defval: null,
        raw: false,
      });

      const fileInfo = parseFilename(file.name);

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