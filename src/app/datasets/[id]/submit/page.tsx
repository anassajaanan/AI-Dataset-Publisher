import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SubmitForm from './SubmitForm';
import connectToDatabase from '@/lib/db/mongodb';
import { Dataset, DatasetVersion, DatasetMetadata } from '@/lib/db/models';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const metadata = {
  title: 'Submit for Review - Dataset Publishing Platform',
  description: 'Submit your dataset for review',
};

interface SubmitPageProps {
  params: {
    id: string;
  };
}

async function getDataset(id: string) {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Get dataset with its latest version and metadata
    const dataset = await Dataset.findById(id);
    
    if (!dataset) {
      return null;
    }
    
    // Get the latest version
    const versions = await DatasetVersion.find({ datasetId: dataset._id })
      .sort({ versionNumber: -1 })
      .limit(1);
    
    // Get the latest metadata
    const metadata = await DatasetMetadata.find({ datasetId: dataset._id })
      .sort({ updatedAt: -1 })
      .limit(1);
    
    return {
      ...dataset.toObject(),
      versions: versions,
      metadata: metadata
    };
  } catch (error) {
    console.error('Error fetching dataset:', error);
    return null;
  }
}

export default async function SubmitPage({ params }: SubmitPageProps) {
  const { id } = params;
  const dataset = await getDataset(id);
  
  if (!dataset) {
    notFound();
  }
  
  const latestVersion = dataset.versions[0];
  const metadata = dataset.metadata[0];
  
  // Check if the dataset is ready for submission
  const canSubmit = latestVersion.status === 'draft' && metadata;
  
  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  return (
    <div className="container mx-auto py-10 px-4 space-y-6">
      <div>
        <Button variant="ghost" asChild className="gap-1">
          <Link href={`/datasets/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to Dataset
          </Link>
        </Button>
      </div>
      
      <h1 className="text-3xl font-bold">Submit for Review</h1>
      
      {!canSubmit && !metadata && (
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-800">Missing Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700 mb-4">
              You need to add metadata to your dataset before submitting it for review.
            </p>
            <Button asChild>
              <Link href={`/datasets/${id}/metadata`}>
                Add Metadata
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
      
      {!canSubmit && latestVersion.status !== 'draft' && (
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-800">Already Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700">
              This dataset has already been submitted for review. Current status: {getStatusLabel(latestVersion.status)}
            </p>
          </CardContent>
        </Card>
      )}
      
      {canSubmit && (
        <Card>
          <CardHeader>
            <CardTitle>Submit Dataset for Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Your dataset will be reviewed by a supervisor. You will be notified when the review is complete.
            </p>
            
            <SubmitForm 
              datasetId={dataset._id ? dataset._id.toString() : id} 
              versionId={latestVersion._id ? latestVersion._id.toString() : ''} 
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
} 