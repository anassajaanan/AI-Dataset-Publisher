import React from 'react';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import SubmitForm from './SubmitForm';

const prisma = new PrismaClient();

export const metadata = {
  title: 'Submit for Review - Dataset Publishing Platform',
  description: 'Submit your dataset for review',
};

interface SubmitPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getDataset(id: string) {
  try {
    const dataset = await prisma.dataset.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
        metadata: {
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
      },
    });
    
    return dataset;
  } catch (error) {
    console.error('Error fetching dataset:', error);
    return null;
  }
}

export default async function SubmitPage({ params }: SubmitPageProps) {
  const { id } = await params;
  const dataset = await getDataset(id);
  
  if (!dataset) {
    notFound();
  }
  
  const latestVersion = dataset.versions[0];
  const metadata = dataset.metadata[0];
  
  // Check if the dataset is ready for submission
  const canSubmit = latestVersion.status === 'draft' && metadata;
  
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-6">
        <Link href={`/datasets/${id}`} className="text-primary hover:underline flex items-center">
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
      
      <h1 className="text-3xl font-bold mb-6">Submit for Review</h1>
      
      {!canSubmit && !metadata && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">Missing Metadata</h2>
          <p className="text-yellow-700 mb-4">
            You need to add metadata to your dataset before submitting it for review.
          </p>
          <Link
            href={`/datasets/${id}/metadata`}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Add Metadata
          </Link>
        </div>
      )}
      
      {!canSubmit && latestVersion.status !== 'draft' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">Already Submitted</h2>
          <p className="text-yellow-700">
            This dataset has already been submitted for review. Current status: {latestVersion.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </p>
        </div>
      )}
      
      {canSubmit && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Submit Dataset for Review</h2>
          <p className="text-gray-600 mb-6">
            Your dataset will be reviewed by a supervisor. You will be notified when the review is complete.
          </p>
          
          <SubmitForm datasetId={id} versionId={latestVersion.id} />
        </div>
      )}
    </div>
  );
} 