import * as XLSX from 'xlsx';
import * as Papa from 'papaparse';

export type FileStats = {
  rowCount: number;
  columns: string[];
  fileSize: number;
  filename: string;
};

export class FileProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileProcessingError';
  }
}

export async function processFile(file: File): Promise<FileStats> {
  try {
    // Get file content as ArrayBuffer
    let arrayBuffer: ArrayBuffer;
    try {
      arrayBuffer = await file.arrayBuffer();
      
      if (arrayBuffer.byteLength === 0) {
        throw new FileProcessingError('File content is empty. Please check the file and try again.');
      }
    } catch (error) {
      if (error instanceof FileProcessingError) {
        throw error;
      }
      throw new FileProcessingError('Failed to read file content. The file may be corrupted.');
    }
    
    const fileSize = file.size;
    const filename = file.name;
    
    // Check if file is empty
    if (fileSize === 0) {
      throw new FileProcessingError('File is empty. Please upload a non-empty file.');
    }
    
    // Get file extension from filename
    const fileExtension = filename.split('.').pop()?.toLowerCase() || '';
    
    // Process based on file extension
    if (fileExtension === 'csv') {
      return await processCSV(arrayBuffer, fileSize, filename);
    } else if (['xls', 'xlsx'].includes(fileExtension)) {
      return await processExcel(arrayBuffer, fileSize, filename);
    } else {
      throw new FileProcessingError(`Unsupported file type: .${fileExtension}. Please upload a CSV or Excel file (.csv, .xls, .xlsx).`);
    }
  } catch (error) {
    if (error instanceof FileProcessingError) {
      throw error;
    }
    throw new FileProcessingError('Failed to process file. Please try again.');
  }
}

async function processCSV(arrayBuffer: ArrayBuffer, fileSize: number, filename: string): Promise<FileStats> {
  return new Promise((resolve, reject) => {
    try {
      // Convert ArrayBuffer to string
      const content = new TextDecoder().decode(arrayBuffer);
      
      if (!content) {
        reject(new FileProcessingError('Failed to read CSV file. The file may be corrupted.'));
        return;
      }
      
      // Remove BOM character if present
      let cleanContent = content;
      if (content.charCodeAt(0) === 0xFEFF) {
        cleanContent = content.slice(1);
      }
      
      if (cleanContent.trim().length === 0) {
        reject(new FileProcessingError('CSV file is empty or contains only whitespace.'));
        return;
      }
      
      Papa.parse<Record<string, unknown>>(cleanContent, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors && results.errors.length > 0) {
            reject(new FileProcessingError('Error parsing CSV file: ' + results.errors[0].message));
            return;
          }
          
          const data = results.data as Record<string, unknown>[];
          const columns = results.meta.fields || [];
          
          if (columns.length === 0) {
            reject(new FileProcessingError('CSV file has no columns or headers. Please ensure your CSV file has headers.'));
            return;
          }
          
          if (data.length === 0) {
            reject(new FileProcessingError('CSV file has no data rows. Please upload a file with data.'));
            return;
          }
          
          resolve({
            rowCount: data.length,
            columns,
            fileSize,
            filename
          });
        },
        error: (error: Error) => {
          reject(new FileProcessingError('Error parsing CSV file: ' + error.message));
        }
      });
    } catch (error) {
      reject(new FileProcessingError('Failed to process CSV file. The file may be corrupted.'));
    }
  });
}

async function processExcel(arrayBuffer: ArrayBuffer, fileSize: number, filename: string): Promise<FileStats> {
  return new Promise((resolve, reject) => {
    try {
      if (arrayBuffer.byteLength === 0) {
        reject(new FileProcessingError('Excel file is empty. Please check the file and try again.'));
        return;
      }
      
      // Read the workbook directly from the array buffer
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        reject(new FileProcessingError('Excel file has no sheets.'));
        return;
      }
      
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      if (!worksheet) {
        reject(new FileProcessingError('Excel sheet is empty or corrupted.'));
        return;
      }
      
      // Convert to JSON with header option
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (!jsonData || jsonData.length === 0) {
        reject(new FileProcessingError('Excel file has no data.'));
        return;
      }
      
      // First row should be headers
      const headers = jsonData[0] as string[];
      if (!headers || headers.length === 0) {
        reject(new FileProcessingError('Excel file has no column headers.'));
        return;
      }
      
      // Data rows (excluding header)
      const dataRows = jsonData.slice(1);
      
      resolve({
        rowCount: dataRows.length,
        columns: headers,
        fileSize,
        filename
      });
    } catch (error) {
      reject(new FileProcessingError('Error processing Excel file. The file may be corrupted or in an unsupported format.'));
    }
  });
} 