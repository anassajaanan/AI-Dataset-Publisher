import React from 'react';
import { MetadataEditor } from '@/components/metadata/MetadataEditor';
import Link from 'next/link';
import { ArrowLeft, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import connectToDatabase from '@/lib/db/mongodb';
import { Dataset } from '@/lib/db/models';
import mongoose from 'mongoose';

interface MetadataPageProps {
  params: {
    id: string;
  };
}

async function getDatasetBasicInfo(id: string) {
  try {
    await connectToDatabase();
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    
    const dataset = await Dataset.findById(id).select('filename fileSize rowCount columns').lean();
    return dataset;
  } catch (error) {
    console.error('Error fetching dataset info:', error);
    return null;
  }
}

export default async function MetadataPage({ params }: MetadataPageProps) {
  const { id: datasetId } = params;
  const datasetInfo = await getDatasetBasicInfo(datasetId);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="gap-1 pl-0 hover:pl-1 transition-all">
            <Link href={`/datasets/${datasetId}`}>
              <ArrowLeft className="h-4 w-4" />
              Back to Dataset
            </Link>
          </Button>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Dataset Metadata</h1>
          <p className="text-muted-foreground max-w-2xl">
            Generate and edit metadata for your dataset. Good metadata helps users discover and understand your dataset.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <div className="space-y-6 sticky top-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">Dataset Info</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  {datasetInfo ? (
                    <>
                      <div>
                        <p className="text-muted-foreground">Filename</p>
                        <p className="font-medium truncate">{datasetInfo.filename}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Rows</p>
                        <p className="font-medium">{datasetInfo.rowCount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Columns</p>
                        <p className="font-medium">{datasetInfo.columns.length}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground">Loading dataset info...</p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">AI Metadata</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <p className="text-muted-foreground">
                    Our AI will analyze your dataset and generate metadata suggestions based on its contents.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Generate multiple options</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Choose the best fit</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Edit to your needs</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Support for Arabic</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="md:col-span-3">
            <Card className="border-2">
              <CardContent className="p-6">
                <MetadataEditor 
                  datasetId={datasetId} 
                  isFileUploaded={!!datasetInfo}
                  onSubmit={() => {
                    // In a real application, this would redirect to the review page
                    window.location.href = `/datasets/${datasetId}`;
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 