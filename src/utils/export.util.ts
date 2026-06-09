import * as XLSX from 'xlsx';

/**
 * Generates a UTF-8 encoded CSV string with BOM from headers and rows.
 */
export function exportToCsvString(headers: string[], rows: any[][]): string {
  const escape = (val: any) => {
    if (val === null || val === undefined) return '';
    let str = String(val);
    str = str.replace(/"/g, '""');
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str}"`;
    }
    return str;
  };

  const headerLine = headers.map(escape).join(',');
  const rowLines = rows.map(row => row.map(escape).join(','));
  return '\ufeff' + [headerLine, ...rowLines].join('\n');
}

/**
 * Generates an Excel XLSX buffer from headers and rows.
 */
export function exportToExcelBuffer(headers: string[], rows: any[][], sheetName = 'Attempts'): Buffer {
  const wb = XLSX.utils.book_new();
  const sheetData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
