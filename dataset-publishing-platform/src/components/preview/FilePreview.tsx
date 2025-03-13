'use client';

import React from 'react';
import { FileStats } from '@/lib/services/fileProcessingService';
import Link from 'next/link';

interface FilePreviewProps {
  fileStats: FileStats;
  datasetId: string;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ fileStats, datasetId }) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="mt-6 p-6 border rounded-lg shadow-sm bg-white">
      <h2 className="text-xl font-semibold mb-4">File Information</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Filename</h3>
          <p className="mt-1 text-lg">{fileStats.filename}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">File Size</h3>
          <p className="mt-1 text-lg">{formatFileSize(fileStats.fileSize)}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Row Count</h3>
          <p className="mt-1 text-lg">{fileStats.rowCount.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Columns</h3>
        <div className="flex flex-wrap gap-2">
          {fileStats.columns.map((column, index) => (
            <span 
              key={index} 
              className="px-3 py-1 bg-gray-100 rounded-full text-sm"
            >
              {column}
            </span>
          ))}
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <Link 
          href={`/datasets/${datasetId}`}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          View Dataset Details
        </Link>
      </div>
    </div>
  );
}; 