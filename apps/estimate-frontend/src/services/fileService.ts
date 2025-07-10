// Сервис для работы с файлами: загрузка, скачивание, парсинг
// Поддержка .xlsx, PDF, .gge, .GSFX, .csv
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export type ParsedFile = {
  name: string;
  type: string;
  content: any;
};

export async function parseFile(file: File): Promise<ParsedFile> {
  if (
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.name.endsWith('.xlsx')
  ) {
    // XLSX
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    return { name: file.name, type: 'xlsx', content: json };
  }
  if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
    // CSV
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        complete: result => resolve({ name: file.name, type: 'csv', content: result.data }),
        error: err => reject(err),
      });
    });
  }
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    // PDF (только для передачи в viewer, парсинг — через pdf.js при необходимости)
    return { name: file.name, type: 'pdf', content: file };
  }
  if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
    // Текстовые
    const text = await file.text();
    return { name: file.name, type: 'text', content: text };
  }
  // TODO: добавить парсинг .gge, .GSFX при наличии спецификации
  return { name: file.name, type: file.type, content: file };
}

export async function downloadFile(name: string, content: Blob | string) {
  const blob = typeof content === 'string' ? new Blob([content]) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}
