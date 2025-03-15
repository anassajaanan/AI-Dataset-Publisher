import React from 'react';
import { Metadata } from 'next';
import { DatasetReview } from '@/components/supervisor/DatasetReview';

export const metadata: Metadata = {
  title: 'Review Dataset - Dataset Publishing Platform',
  description: 'Review dataset details and approve or reject submission',
};

export default function ReviewPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-10 px-4">
      <DatasetReview datasetId={params.id} />
    </div>
  );
} 