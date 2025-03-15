import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  FileText, 
  Database, 
  Tag, 
  Calendar, 
  BarChart2,
  Clock,
  CheckCircle2,
  XCircle,
  Globe,
  AlertCircle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReviewActions from './ReviewActions';
import connectToDatabase from '@/lib/db/mongodb';
import { Dataset, DatasetVersion, DatasetMetadata } from '@/lib/db/models';

interface ReviewPageProps {
  params: {
    id: string;
  };
}

// Define interfaces for MongoDB document types
interface MongoDocument {
  _id: any;
  toObject: () => any;
}

interface DatasetDocument extends MongoDocument {
  filename: string;
  fileSize: number;
  rowCount: number;
  columns: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface VersionDocument extends MongoDocument {
  datasetId: any;
  versionNumber: number;
  status: string;
  comments?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MetadataDocument extends MongoDocument {
  datasetId: any;
  title?: string;
  titleArabic?: string;
  description?: string;
  descriptionArabic?: string;
  category?: string;
  categoryArabic?: string;
  keywords?: string[];
  keywordsArabic?: string[];
  language?: string;
}

// Define interface for enhanced dataset
interface EnhancedDataset {
  _id: any;
  filename: string;
  fileSize: number;
  rowCount: number;
  columns: string[];
  createdAt: Date;
  updatedAt: Date;
  versions: VersionDocument[];
  metadata: MetadataDocument | null;
}

export const metadata = {
  title: 'Review Dataset - Dataset Publishing Platform',
  description: 'Review and approve or reject a dataset',
};

async function getDataset(id: string) {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Get dataset with its latest version and metadata
    const dataset = await Dataset.findById(id) as DatasetDocument | null;
    
    if (!dataset) {
      return null;
    }
    
    // Get all versions
    const versions = await DatasetVersion.find({ datasetId: dataset._id })
      .sort({ versionNumber: -1 }) as VersionDocument[];
    
    // Get the latest metadata
    const metadata = await DatasetMetadata.findOne({ datasetId: dataset._id })
      .sort({ updatedAt: -1 }) as MetadataDocument | null;
    
    return {
      ...dataset.toObject(),
      versions: versions,
      metadata: metadata ? metadata.toObject() : null
    } as EnhancedDataset;
  } catch (error) {
    console.error('Error fetching dataset:', error);
    return null;
  }
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const id = params.id;
  const dataset = await getDataset(id);
  
  if (!dataset) {
    notFound();
  }
  
  const latestVersion = dataset.versions[0];
  const metadata = dataset.metadata;
  
  // Check if the dataset is pending review
  const isPendingReview = latestVersion.status === 'review';
  
  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'review':
        return <Badge variant="warning" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending Review</Badge>;
      case 'published':
        return <Badge variant="success" className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Group columns into chunks for better display
  const columnChunks = [];
  const chunkSize = 5;
  for (let i = 0; i < dataset.columns.length; i += chunkSize) {
    columnChunks.push(dataset.columns.slice(i, i + chunkSize));
  }
  
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center mb-2">
          <Button variant="ghost" size="sm" asChild className="gap-1 pl-0 hover:pl-1 transition-all">
            <Link href="/supervisor/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Review Dataset</h1>
            <div className="flex items-center gap-2 flex-wrap">
              {getStatusBadge(latestVersion.status)}
              <div className="flex items-center text-sm text-muted-foreground">
                <span>Version {latestVersion.versionNumber}</span>
                <span className="mx-2">•</span>
                <Calendar className="h-3.5 w-3.5 mr-1" />
                <span>Submitted on {formatDate(latestVersion.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {!isPendingReview && (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">This dataset is not pending review.</p>
              </div>
              <p className="text-amber-700 mt-2">
                Current status: {latestVersion.status.charAt(0).toUpperCase() + latestVersion.status.slice(1)}
              </p>
            </CardContent>
          </Card>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <Card className="md:col-span-4">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>File Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Filename</p>
                  <p className="font-medium truncate">{dataset.filename}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Size</p>
                  <p className="font-medium">{formatFileSize(dataset.fileSize)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rows</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{dataset.rowCount.toLocaleString()}</p>
                    <BarChart2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Columns</p>
                  <p className="font-medium">{dataset.columns.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-8">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  <CardTitle>Columns</CardTitle>
                </div>
                <Badge variant="outline" className="bg-primary/5">
                  {dataset.columns.length} total
                </Badge>
              </div>
              <CardDescription>
                The dataset contains the following columns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {columnChunks.map((chunk, chunkIndex) => (
                  <div key={chunkIndex} className="space-y-2">
                    {chunk.map((column: string, index: number) => (
                      <div 
                        key={index}
                        className="px-3 py-2 rounded-md bg-primary/5 text-sm font-medium truncate"
                        title={column}
                      >
                        {column}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {metadata && (
          <Card>
            <Tabs defaultValue="english">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-primary" />
                    <CardTitle>Metadata</CardTitle>
                  </div>
                  {metadata.language === 'both' && (
                    <div className="flex border rounded-md overflow-hidden">
                      <TabsList>
                        <TabsTrigger value="english">English</TabsTrigger>
                        <TabsTrigger value="arabic" className="flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          Arabic
                        </TabsTrigger>
                      </TabsList>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* English Metadata */}
                <TabsContent value="english">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Title</h3>
                        <p className="text-lg font-medium">{metadata.title}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Category</h3>
                        <Badge variant="secondary" className="text-sm font-normal">
                          {metadata.category}
                        </Badge>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {metadata.keywords && metadata.keywords.map((tag: string, index: number) => (
                            <Badge key={index} variant="outline" className="bg-primary/5">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                      <p className="text-foreground whitespace-pre-line">{metadata.description}</p>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Arabic Metadata */}
                {(metadata.language === 'ar' || metadata.language === 'both') && (
                  <TabsContent value="arabic">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" dir="rtl">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">العنوان</h3>
                          <p className="text-lg font-medium">{metadata.titleArabic || metadata.title}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">الفئة</h3>
                          <Badge variant="secondary" className="text-sm font-normal">
                            {metadata.categoryArabic || metadata.category}
                          </Badge>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">الكلمات المفتاحية</h3>
                          <div className="flex flex-wrap gap-2">
                            {metadata && metadata.keywords && (
                              (metadata.keywordsArabic && metadata.keywordsArabic.length > 0 
                                ? metadata.keywordsArabic 
                                : metadata.keywords).map((tag: string, index: number) => (
                                <Badge key={index} variant="outline" className="bg-primary/5">
                                  {tag}
                                </Badge>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">الوصف</h3>
                        <p className="text-foreground whitespace-pre-line">{metadata.descriptionArabic || metadata.description}</p>
                      </div>
                    </div>
                  </TabsContent>
                )}
              </CardContent>
            </Tabs>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Version History</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Version</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {dataset.versions.map((version: any) => (
                    <tr key={version._id ? version._id.toString() : `version-${version.versionNumber}`} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{version.versionNumber}</td>
                      <td className="py-3 px-4">{formatDate(version.createdAt)}</td>
                      <td className="py-3 px-4">
                        {getStatusBadge(version.status)}
                      </td>
                      <td className="py-3 px-4">{version.comments || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        {isPendingReview && (
          <Card>
            <CardHeader>
              <CardTitle>Review Decision</CardTitle>
              <CardDescription>
                Approve or reject this dataset based on your review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReviewActions 
                datasetId={dataset._id.toString()} 
                versionId={latestVersion._id.toString()} 
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 