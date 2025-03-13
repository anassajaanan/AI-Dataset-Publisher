'use client';

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { FilePreview } from '../preview/FilePreview';

export type FileStats = {
  rowCount: number;
  columns: string[];
  fileSize: number;
  filename: string;
};

export const FileUpload: React.FC = () => {
  const [fileStats, setFileStats] = useState<FileStats | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Validate file type
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Invalid file type. Please upload a CSV or Excel file.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      if (response.data && response.data.fileStats) {
        setFileStats(response.data.fileStats);
      } else {
        setErrorMessage('Failed to process file.');
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setErrorMessage(error.response.data.message || 'Error uploading file.');
      } else {
        setErrorMessage('Error uploading file.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`border-dashed border-2 rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
        }`}
        tabIndex={0}
        aria-label="File Upload Area"
        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.click(); }}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <div>
            <p className="text-lg font-medium">Drag & drop a file here, or click to select</p>
            <p className="text-sm text-gray-500 mt-1">Supports CSV and Excel files only</p>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="mt-4 text-center">
          <p className="text-gray-600">Processing file...</p>
          {/* Add a loading spinner here if desired */}
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md" role="alert">
          <p className="text-red-600">{errorMessage}</p>
        </div>
      )}

      {fileStats && <FilePreview fileStats={fileStats} />}
    </div>
  );
}; 