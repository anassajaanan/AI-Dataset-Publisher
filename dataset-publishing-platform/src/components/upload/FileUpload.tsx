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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Reset previous state
    setUploadedFile(file);
    setFileStats(null);
    setErrorMessage('');
    setDatasetId(null);
    setIsLoading(true);
    setUploadProgress(0);
    
    // Validate file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const validExtensions = ['csv', 'xls', 'xlsx'];
    
    if (!validExtensions.includes(fileExtension)) {
      setErrorMessage(`Invalid file type: .${fileExtension}. Please upload a CSV or Excel file (.csv, .xls, .xlsx).`);
      setIsLoading(false);
      return;
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setErrorMessage(`File is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum size is 10MB.`);
      setIsLoading(false);
      return;
    }
    
    // Validate file is not empty
    if (file.size === 0) {
      setErrorMessage('File is empty. Please upload a non-empty file.');
      setIsLoading(false);
      return;
    }
    
    try {
      // Create a FormData instance
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      });
      
      if (response.data && response.data.fileStats) {
        setFileStats(response.data.fileStats);
        if (response.data.datasetId) {
          setDatasetId(response.data.datasetId);
        }
      } else {
        setErrorMessage('Failed to process file. Server response did not include file statistics.');
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data.message || 'Error uploading file. Please try again.';
        setErrorMessage(errorMessage);
      } else {
        setErrorMessage('Error uploading file. Please check your network connection and try again.');
      }
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({ 
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      // Add more generic types to handle different browser implementations
      'application/octet-stream': ['.csv', '.xls', '.xlsx'],
      'application/csv': ['.csv'],
      'text/plain': ['.csv']
    },
    maxFiles: 1,
    multiple: false
  });

  const resetUpload = () => {
    setFileStats(null);
    setErrorMessage('');
    setUploadedFile(null);
    setDatasetId(null);
    setUploadProgress(0);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!fileStats && (
        <div
          {...getRootProps()}
          className={`border-dashed border-2 rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive && !isDragReject ? 'border-primary bg-primary/10' : 
            isDragReject ? 'border-red-500 bg-red-50' : 
            'border-gray-300 hover:border-primary'
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
              <p className="text-lg font-medium">
                {isDragActive ? 'Drop the file here' : 'Drag & drop a file here, or click to select'}
              </p>
              <p className="text-sm text-gray-500 mt-1">Supports CSV and Excel files (.csv, .xls, .xlsx)</p>
              <p className="text-sm text-gray-500">Maximum file size: 10MB</p>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex flex-col items-center justify-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-blue-600">
                {uploadProgress < 100 
                  ? `Uploading: ${uploadProgress}%` 
                  : 'Processing file...'}
                {uploadedFile && ` - ${uploadedFile.name}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md" role="alert">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-red-600 font-medium">Error</p>
              <p className="text-red-600">{errorMessage}</p>
              <button 
                onClick={resetUpload}
                className="mt-2 text-sm text-red-600 underline hover:text-red-800"
              >
                Try again with a different file
              </button>
            </div>
          </div>
        </div>
      )}

      {fileStats && datasetId && (
        <div className="mt-4">
          <FilePreview fileStats={fileStats} datasetId={datasetId} />
          <button 
            onClick={resetUpload}
            className="mt-4 text-sm text-gray-600 underline hover:text-gray-800"
          >
            Upload a different file
          </button>
        </div>
      )}
    </div>
  );
}; 