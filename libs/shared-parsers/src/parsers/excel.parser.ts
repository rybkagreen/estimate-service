import * as XLSX from 'xlsx';

export class ExcelParser {
  parse(filePath: string): any[] {
    const workbook = XLSX.readFile(filePath);
    const data: any[] = [];
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      data.push(...sheetData);
    });
    return data;
  }
}
