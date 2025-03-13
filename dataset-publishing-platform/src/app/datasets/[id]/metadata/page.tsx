import React from 'react';
import { MetadataEditor } from '@/components/metadata/MetadataEditor';
import Link from 'next/link';

export const metadata = {
  title: 'Edit Metadata - Dataset Publishing Platform',
  description: 'Edit and generate metadata for your dataset',
};

interface MetadataPageProps {
  params: {
    id: string;
  };
}

export default function MetadataPage({ params }: MetadataPageProps) {
  const datasetId = params.id;
  
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-6">
        <Link href={`/datasets/${datasetId}`} className="text-primary hover:underline flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Dataset
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Edit Dataset Metadata</h1>
      <p className="text-gray-600 mb-8 max-w-2xl">
        Edit the metadata for your dataset or generate it automatically using AI.
        The metadata will help users understand and discover your dataset.
      </p>
      
      <MetadataEditor 
        datasetId={datasetId} 
        onSubmit={() => {
          // In a real application, this would redirect to the review page
          window.location.href = `/datasets/${datasetId}`;
        }}
      />
    </div>
  );
} 