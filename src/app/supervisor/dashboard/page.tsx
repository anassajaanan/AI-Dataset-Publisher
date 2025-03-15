import React from 'react';
import Link from 'next/link';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  FileText,
  Database
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import connectToDatabase from '@/lib/db/mongodb';
import { Dataset, DatasetVersion, DatasetMetadata } from '@/lib/db/models';

export const metadata = {
  title: 'Supervisor Dashboard - Dataset Publishing Platform',
  description: 'Review and manage datasets submitted for approval',
};

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
  description?: string;
  category?: string;
  keywords?: string[];
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

async function getDatasets() {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Get all datasets with their latest versions and metadata
    const datasets = await Dataset.find().sort({ updatedAt: -1 }) as DatasetDocument[];
    
    const enhancedDatasets = await Promise.all(
      datasets.map(async (dataset) => {
        // Get the latest version
        const versions = await DatasetVersion.find({ datasetId: dataset._id })
          .sort({ versionNumber: -1 })
          .limit(1) as VersionDocument[];
        
        // Get the latest metadata
        const metadata = await DatasetMetadata.find({ datasetId: dataset._id })
          .sort({ updatedAt: -1 })
          .limit(1) as MetadataDocument[];
        
        return {
          ...dataset.toObject(),
          versions: versions,
          metadata: metadata.length > 0 ? metadata[0] : null
        } as EnhancedDataset;
      })
    );
    
    return enhancedDatasets;
  } catch (error) {
    console.error('Error fetching datasets:', error);
    return [] as EnhancedDataset[];
  }
}

export default async function SupervisorDashboard() {
  const datasets = await getDatasets();
  
  // Filter datasets by status
  const pendingReview = datasets.filter(dataset => 
    dataset.versions && 
    dataset.versions.length > 0 && 
    dataset.versions[0].status === 'review'
  );
  
  const approved = datasets.filter(dataset => 
    dataset.versions && 
    dataset.versions.length > 0 && 
    dataset.versions[0].status === 'published'
  );
  
  const rejected = datasets.filter(dataset => 
    dataset.versions && 
    dataset.versions.length > 0 && 
    dataset.versions[0].status === 'rejected'
  );
  
  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
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
  
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supervisor Dashboard</h1>
          <p className="text-muted-foreground mt-1">Review and manage datasets submitted for approval</p>
        </div>
      </div>
      
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Review
            <Badge variant="secondary" className="ml-1">{pendingReview.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Approved
            <Badge variant="secondary" className="ml-1">{approved.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Rejected
            <Badge variant="secondary" className="ml-1">{rejected.length}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          {pendingReview.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No datasets pending review</p>
              </CardContent>
            </Card>
          ) : (
            pendingReview.map((dataset) => (
              <Card key={dataset._id.toString()} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x">
                    <div className="md:col-span-9 p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">
                            {dataset.metadata?.title || dataset.filename}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <FileText className="h-4 w-4" />
                            <span>{dataset.filename}</span>
                            <span className="mx-1">•</span>
                            <Database className="h-4 w-4" />
                            <span>{dataset.rowCount.toLocaleString()} rows</span>
                            <span className="mx-1">•</span>
                            <span>Submitted on {formatDate(dataset.updatedAt)}</span>
                          </div>
                          {getStatusBadge(dataset.versions[0].status)}
                        </div>
                      </div>
                      
                      {dataset.metadata && (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground font-medium mb-1">Description:</p>
                          <p className="text-sm line-clamp-2">
                            {dataset.metadata.description || 'No description provided'}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="md:col-span-3 p-6 flex flex-col justify-center items-center gap-2">
                      <Button asChild className="w-full">
                        <Link href={`/supervisor/review/${dataset._id.toString()}`}>
                          Review Dataset
                        </Link>
                      </Button>
                      <Button variant="outline" asChild className="w-full">
                        <Link href={`/datasets/${dataset._id.toString()}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="approved" className="space-y-4">
          {approved.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No approved datasets</p>
              </CardContent>
            </Card>
          ) : (
            approved.map((dataset) => (
              <Card key={dataset._id.toString()}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">
                        {dataset.metadata?.title || dataset.filename}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <FileText className="h-4 w-4" />
                        <span>{dataset.filename}</span>
                        <span className="mx-1">•</span>
                        <Database className="h-4 w-4" />
                        <span>{dataset.rowCount.toLocaleString()} rows</span>
                        <span className="mx-1">•</span>
                        <span>Approved on {formatDate(dataset.updatedAt)}</span>
                      </div>
                      {getStatusBadge(dataset.versions[0].status)}
                    </div>
                    <Button variant="outline" asChild>
                      <Link href={`/datasets/${dataset._id.toString()}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="rejected" className="space-y-4">
          {rejected.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No rejected datasets</p>
              </CardContent>
            </Card>
          ) : (
            rejected.map((dataset) => (
              <Card key={dataset._id.toString()}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">
                        {dataset.metadata?.title || dataset.filename}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <FileText className="h-4 w-4" />
                        <span>{dataset.filename}</span>
                        <span className="mx-1">•</span>
                        <Database className="h-4 w-4" />
                        <span>{dataset.rowCount.toLocaleString()} rows</span>
                        <span className="mx-1">•</span>
                        <span>Rejected on {formatDate(dataset.updatedAt)}</span>
                      </div>
                      {getStatusBadge(dataset.versions[0].status)}
                    </div>
                    <Button variant="outline" asChild>
                      <Link href={`/datasets/${dataset._id.toString()}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                  
                  {dataset.versions[0].comments && (
                    <div className="mt-4 p-3 bg-red-50 rounded-md">
                      <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
                      <p className="text-sm text-red-700">{dataset.versions[0].comments}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 