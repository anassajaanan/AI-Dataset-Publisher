import * as XLSX from 'xlsx';
import * as Papa from 'papaparse';
import { FileStats } from '@/components/upload/FileUpload';

export class FileProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileProcessingError';
  }
}

export async function processFile(file: File): Promise<FileStats> {
  try {
    const fileType = file.type;
    const fileSize = file.size;
    const filename = file.name;
    
    // Process based on file type
    if (fileType === 'text/csv') {
      return await processCSV(file, fileSize, filename);
    } else if (
      fileType === 'application/vnd.ms-excel' || 
      fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      return await processExcel(file, fileSize, filename);
    } else {
      throw new FileProcessingError('Unsupported file type. Please upload a CSV or Excel file.');
    }
  } catch (error) {
    if (error instanceof FileProcessingError) {
      throw error;
    }
    throw new FileProcessingError('Failed to process file. Please try again.');
  }
}

async function processCSV(file: File, fileSize: number, filename: string): Promise<FileStats> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
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
          reject(new FileProcessingError('CSV file has no columns.'));
          return;
        }
        
        resolve({
          rowCount: data.length,
          columns,
          fileSize,
          filename
        });
      },
      error: (error) => {
        reject(new FileProcessingError('Error parsing CSV file: ' + error.message));
      }
    });
  });
}

async function processExcel(file: File, fileSize: number, filename: string): Promise<FileStats> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new FileProcessingError('Failed to read Excel file.'));
          return;
        }
        
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Extract column names
        const columns = jsonData.length > 0 
          ? Object.keys(jsonData[0] as object) 
          : [];
        
        if (columns.length === 0) {
          reject(new FileProcessingError('Excel file has no columns.'));
          return;
        }
        
        resolve({
          rowCount: jsonData.length,
          columns,
          fileSize,
          filename
        });
      } catch (error) {
        reject(new FileProcessingError('Error processing Excel file.'));
      }
    };
    
    reader.onerror = () => {
      reject(new FileProcessingError('Failed to read Excel file.'));
    };
    
    reader.readAsArrayBuffer(file);
  });
} 