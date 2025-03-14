import React from 'react';
import { MetadataEditor } from '@/components/metadata/MetadataEditor';
import Link from 'next/link';
import { ArrowLeft, FileText, Sparkles, Database, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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
  const datasetId = params.id;
  const datasetInfo = await getDatasetBasicInfo(datasetId);
  
  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="gap-1 pl-0 hover:pl-1 transition-all">
            <Link href={`/datasets/${datasetId}`}>
              <ArrowLeft className="h-4 w-4" />
              Back to Dataset
            </Link>
          </Button>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-3">Dataset Metadata</h1>
          <p className="text-muted-foreground max-w-2xl">
            Generate and edit metadata for your dataset. Good metadata helps users discover and understand your dataset.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-3">
            <div className="space-y-6 sticky top-6">
              <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader className="pb-3 border-b bg-white/80">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">Dataset Info</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm pt-4">
                  {datasetInfo ? (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <p className="text-xs text-muted-foreground uppercase font-medium">Filename</p>
                          <p className="font-medium truncate">{datasetInfo.filename}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-medium">Size</p>
                          <p className="font-medium">{formatFileSize(datasetInfo.fileSize)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-medium">Rows</p>
                          <div className="flex items-center gap-1">
                            <p className="font-medium">{datasetInfo.rowCount.toLocaleString()}</p>
                            <BarChart2 className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-medium">Columns</p>
                          <p className="font-medium">{datasetInfo.columns.length}</p>
                        </div>
                        <div className="col-span-2 pt-2">
                          <p className="text-xs text-muted-foreground uppercase font-medium mb-2">Column Preview</p>
                          <div className="flex flex-wrap gap-1">
                            {datasetInfo.columns.slice(0, 5).map((column: string, index: number) => (
                              <Badge key={index} variant="outline" className="bg-white text-xs">
                                {column}
                              </Badge>
                            ))}
                            {datasetInfo.columns.length > 5 && (
                              <Badge variant="outline" className="bg-white text-xs">
                                +{datasetInfo.columns.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-32">
                      <p className="text-muted-foreground">Loading dataset info...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader className="pb-3 border-b bg-white/80">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">AI Metadata</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm pt-4">
                  <p className="text-muted-foreground">
                    Our AI will analyze your dataset and generate metadata suggestions based on its contents.
                  </p>
                  <ul className="space-y-2.5">
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mr-2 mt-0.5">
                        <span className="text-xs font-medium text-primary">1</span>
                      </div>
                      <span>Generate multiple options</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mr-2 mt-0.5">
                        <span className="text-xs font-medium text-primary">2</span>
                      </div>
                      <span>Choose the best fit</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mr-2 mt-0.5">
                        <span className="text-xs font-medium text-primary">3</span>
                      </div>
                      <span>Edit to your needs</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mr-2 mt-0.5">
                        <span className="text-xs font-medium text-primary">4</span>
                      </div>
                      <span>Support for Arabic</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="md:col-span-9">
            <Card className="border shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b pb-4">
                <CardTitle>Generate & Edit Metadata</CardTitle>
                <CardDescription>
                  Use AI to generate metadata or edit it manually to best describe your dataset
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <MetadataEditor 
                  datasetId={datasetId} 
                  isFileUploaded={!!datasetInfo}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 