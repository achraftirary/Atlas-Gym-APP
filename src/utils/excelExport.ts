import * as XLSX from 'xlsx';

export interface ExcelRow {
  [key: string]: any;
}

const getColumnWidths = (data: ExcelRow[]): number[] => {
  if (!data || data.length === 0) return [];
  
  const keys = Object.keys(data[0]);
  return keys.map(key => {
    const maxLength = Math.max(
      key.length,
      ...data.map(row => String(row[key] || '').length)
    );
    return Math.min(maxLength + 2, 50); // Cap at 50 for extreme values
  });
};

const formatHeaderRow = (ws: XLSX.WorkSheet, colCount: number): void => {
  for (let i = 0; i < colCount; i++) {
    const cellRef = XLSX.utils.encode_col(i) + '1';
    if (ws[cellRef]) {
      ws[cellRef].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '4472C4' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      };
    }
  }
};

export const exportToExcel = (
  data: ExcelRow[],
  fileName: string,
  sheetName: string = 'Report'
): void => {
  try {
    if (!data || data.length === 0) {
      console.warn('No data provided to exportToExcel');
      return;
    }

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Convert data to sheet
    const ws = XLSX.utils.json_to_sheet(data);

    // Calculate and set column widths based on content
    const colWidths = getColumnWidths(data);
    ws['!cols'] = colWidths.map((width) => ({ wch: width }));

    // Format header row
    formatHeaderRow(ws, Object.keys(data[0]).length);

    // Add sheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31)); // Sheet names max 31 chars

    // Generate file with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const sanitizedFileName = fileName.replace(/[<>:"/\\|?*]/g, '-');
    const fullFileName = `${sanitizedFileName}-${timestamp}.xlsx`;

    // Trigger download
    XLSX.writeFile(wb, fullFileName);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error(`Failed to export Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const exportMultipleSheetsToExcel = (
  sheetsData: Array<{ name: string; data: ExcelRow[] }>,
  fileName: string
): void => {
  try {
    if (!sheetsData || sheetsData.length === 0) {
      console.warn('No sheets data provided to exportMultipleSheetsToExcel');
      return;
    }

    const wb = XLSX.utils.book_new();

    sheetsData.forEach(({ name, data }) => {
      if (data && data.length > 0) {
        const ws = XLSX.utils.json_to_sheet(data);
        const colWidths = getColumnWidths(data);
        ws['!cols'] = colWidths.map((width) => ({ wch: width }));
        formatHeaderRow(ws, Object.keys(data[0]).length);
        XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
      }
    });

    if (wb.SheetNames.length === 0) {
      console.warn('No valid sheets to export');
      return;
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    const sanitizedFileName = fileName.replace(/[<>:"/\\|?*]/g, '-');
    const fullFileName = `${sanitizedFileName}-${timestamp}.xlsx`;
    XLSX.writeFile(wb, fullFileName);
  } catch (error) {
    console.error('Error exporting multiple sheets to Excel:', error);
    throw new Error(`Failed to export Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const exportReportWithMetadata = (
  title: string,
  data: ExcelRow[],
  fileName: string,
  metadata?: { [key: string]: any }
): void => {
  try {
    if (!title || !fileName) {
      throw new Error('Title and fileName are required');
    }

    const wb = XLSX.utils.book_new();

    // Metadata sheet
    if (metadata && Object.keys(metadata).length > 0) {
      const metadataRows = Object.entries(metadata).map(([key, value]) => ({
        Field: key,
        Value: value,
      }));
      const metaWs = XLSX.utils.json_to_sheet(metadataRows);
      metaWs['!cols'] = [{ wch: 25 }, { wch: 30 }];
      formatHeaderRow(metaWs, 2);
      XLSX.utils.book_append_sheet(wb, metaWs, 'Metadata');
    }

    // Data sheet
    if (data && data.length > 0) {
      const ws = XLSX.utils.json_to_sheet(data);
      const colWidths = getColumnWidths(data);
      ws['!cols'] = colWidths.map((width) => ({ wch: width }));
      formatHeaderRow(ws, Object.keys(data[0]).length);
      XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 31));
    } else {
      console.warn('No data provided for report');
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    const sanitizedFileName = fileName.replace(/[<>:"/\\|?*]/g, '-');
    const fullFileName = `${sanitizedFileName}-${timestamp}.xlsx`;
    XLSX.writeFile(wb, fullFileName);
  } catch (error) {
    console.error('Error exporting report with metadata to Excel:', error);
    throw new Error(`Failed to export Excel report: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
