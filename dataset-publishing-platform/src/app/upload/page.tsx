import React from 'react';
import { FileUpload } from '@/components/upload/FileUpload';

export const metadata = {
  title: 'Upload Dataset - Dataset Publishing Platform',
  description: 'Upload your CSV or Excel dataset for processing and publishing',
};

export default function UploadPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Upload Dataset</h1>
      <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
        Upload your CSV or Excel file to begin the dataset publishing process. 
        We'll analyze your file and help you generate metadata.
      </p>
      
      <FileUpload />
    </div>
  );
} 