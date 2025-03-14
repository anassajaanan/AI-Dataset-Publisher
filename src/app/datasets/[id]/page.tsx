"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  FileText, 
  Database, 
  Tag, 
  Calendar, 
  BarChart2,
  Pencil,
  Send,
  Globe
} from 'lucide-react';
import connectToDatabase from '@/lib/db/mongodb';
import { Dataset, DatasetVersion, DatasetMetadata, IDatasetVersion } from '@/lib/db/models';
import mongoose from 'mongoose';

export const metadata = {
  title: 'Dataset Details - Dataset Publishing Platform',
  description: 'View dataset details and metadata',
};

interface DatasetPageProps {
  params: {
    id: string;
  };
}

async function getDataset(id: string) {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Validate id format to prevent CastError
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      console.error(`Invalid ObjectId: ${id}`);
      return null;
    }
    
    // Get dataset with its latest version and metadata
    const dataset = await Dataset.findById(id);
    
    if (!dataset) {
      return null;
    }
    
    // Get latest version
    const versions = await DatasetVersion.find({ datasetId: dataset._id })
      .sort({ versionNumber: -1 })
      .limit(1)
      .lean();
    
    // Get metadata if available
    let metadata = null;
    if (versions.length > 0) {
      metadata = await DatasetMetadata.findOne({ versionId: versions[0]._id }).lean();
    }
    
    // Return dataset with versions and metadata
    return {
      ...dataset.toObject(),
      versions,
      metadata
    };
  } catch (error) {
    console.error('Error fetching dataset:', error);
    return null;
  }
}

export default function DatasetPage({ params }: DatasetPageProps) {
  const [activeTab, setActiveTab] = useState<'english' | 'arabic'>('english');
  
  // Fetch dataset data
  const [dataset, setDataset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const id = params.id;
        if (!id) {
          throw new Error('Dataset ID is required');
        }
        
        const response = await fetch(`/api/datasets/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch dataset');
        }
        
        const data = await response.json();
        setDataset(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [params.id]);
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (error || !dataset) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Dataset</h1>
          <p className="text-muted-foreground mb-6">{error || 'Dataset not found'}</p>
          <Button asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  const latestVersion = dataset.versions[0];
  const metadata = dataset.metadata;
  
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
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'submitted': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'submitted': return 'Submitted';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center mb-2">
        <Button variant="ghost" size="sm" asChild className="gap-1 pl-0 hover:pl-1 transition-all">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{dataset.filename}</h1>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusVariant(latestVersion.status)}>
              {getStatusLabel(latestVersion.status)}
            </Badge>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>Version {latestVersion.versionNumber}</span>
              <span className="mx-2">•</span>
              <Calendar className="h-3.5 w-3.5 mr-1" />
              <span>{formatDate(dataset.createdAt)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 self-end md:self-auto">
          <Button variant="outline" asChild>
            <Link href={`/datasets/${dataset._id}/metadata`}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Metadata
            </Link>
          </Button>
          
          {latestVersion.status === 'draft' && (
            <Button asChild>
              <Link href={`/datasets/${dataset._id}/submit`}>
                <Send className="h-4 w-4 mr-2" />
                Submit for Review
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>File Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Filename</p>
              <p className="font-medium">{dataset.filename}</p>
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
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle>Columns</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {dataset.columns.map((column: string, index: number) => (
                <Badge 
                  key={index} 
                  variant="outline"
                  className="bg-primary/5 hover:bg-primary/10 text-foreground border-primary/20"
                >
                  {column}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {metadata ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              <CardTitle>Metadata</CardTitle>
            </div>
            <div className="flex border-b">
              <Button 
                variant="ghost" 
                className={`relative px-4 py-2 font-medium ${activeTab === 'english' ? 'active-tab' : ''}`}
                onClick={() => setActiveTab('english')}
              >
                English
                {activeTab === 'english' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
                )}
              </Button>
              
              {metadata.titleArabic && (
                <Button 
                  variant="ghost" 
                  className={`relative px-4 py-2 font-medium ${activeTab === 'arabic' ? 'active-tab' : ''}`}
                  onClick={() => setActiveTab('arabic')}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Arabic
                  {activeTab === 'arabic' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* English Metadata */}
            {activeTab === 'english' && (
              <div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Title</h3>
                  <p className="text-lg font-medium">{metadata.title}</p>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                  <p className="text-foreground">{metadata.description}</p>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {metadata.tags && metadata.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Category</h3>
                  <p className="text-foreground">{metadata.category}</p>
                </div>
              </div>
            )}
            
            {/* Arabic Metadata */}
            {activeTab === 'arabic' && metadata.titleArabic && (
              <div dir="rtl">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">العنوان</h3>
                  <p className="text-lg font-medium">{metadata.titleArabic}</p>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">الوصف</h3>
                  <p className="text-foreground">{metadata.descriptionArabic}</p>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">الكلمات المفتاحية</h3>
                  <div className="flex flex-wrap gap-2">
                    {metadata.tags && metadata.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">الفئة</h3>
                  <p className="text-foreground">{metadata.category}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center">
          <CardContent className="pt-6 pb-6">
            <p className="text-muted-foreground mb-4">No metadata has been added for this dataset yet.</p>
            <Button asChild>
              <Link href={`/datasets/${dataset._id}/metadata`}>
                <Pencil className="h-4 w-4 mr-2" />
                Add Metadata
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader className="pb-3">
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
                  <tr key={version._id ? version._id.toString() : `version-${version.versionNumber}`} className="border-b">
                    <td className="py-3 px-4">{version.versionNumber}</td>
                    <td className="py-3 px-4">{formatDate(version.createdAt)}</td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusVariant(version.status)}>
                        {getStatusLabel(version.status)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{version.comments || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 