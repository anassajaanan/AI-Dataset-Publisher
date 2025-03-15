'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import ReviewActions from '@/app/supervisor/review/[id]/ReviewActions';

interface Dataset {
  _id: string;
  id?: string;
  filename: string;
  fileSize: number;
  rowCount: number;
  columns: string[];
  createdAt: string;
  updatedAt: string;
  versions: Version[];
  metadata: Metadata | null;
}

interface Version {
  _id: string;
  id?: string;
  datasetId: string;
  versionNumber: number;
  status: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

interface Metadata {
  _id: string;
  id?: string;
  datasetId: string;
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

interface DatasetReviewProps {
  datasetId: string;
}

export function DatasetReview({ datasetId }: DatasetReviewProps) {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDataset = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/datasets/${datasetId}`);
        setDataset(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dataset:', err);
        setError('Failed to load dataset. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDataset();
  }, [datasetId]);

  const formatDate = (dateString: string) => {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Dataset not found</p>
        <Button asChild>
          <Link href="/supervisor/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const latestVersion = dataset.versions && dataset.versions.length > 0 ? dataset.versions[0] : null;
  const metadata = dataset.metadata;
  
  // Check if the dataset is pending review
  const isPendingReview = latestVersion?.status === 'review';
  
  // Group columns into chunks for better display
  const columnChunks = [];
  const chunkSize = 5;
  for (let i = 0; i < dataset.columns.length; i += chunkSize) {
    columnChunks.push(dataset.columns.slice(i, i + chunkSize));
  }
  
  return (
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
            {latestVersion && getStatusBadge(latestVersion.status)}
            <div className="flex items-center text-sm text-muted-foreground">
              <span>Version {latestVersion?.versionNumber || 1}</span>
              <span className="mx-2">•</span>
              <Calendar className="h-3.5 w-3.5 mr-1" />
              <span>Submitted on {latestVersion ? formatDate(latestVersion.createdAt) : 'Unknown'}</span>
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
              Current status: {latestVersion?.status ? latestVersion.status.charAt(0).toUpperCase() + latestVersion.status.slice(1) : 'Unknown'}
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
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              <CardTitle>Metadata</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {metadata ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">English</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Title</p>
                        <p className="font-medium">{metadata.title || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Description</p>
                        <p>{metadata.description || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Category</p>
                        <p>{metadata.category || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Keywords</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {metadata.keywords && metadata.keywords.length > 0 ? (
                            metadata.keywords.map((keyword, index) => (
                              <Badge key={index} variant="secondary">{keyword}</Badge>
                            ))
                          ) : (
                            <p>Not provided</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Arabic</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Title</p>
                        <p className="font-medium" dir="rtl">{metadata.titleArabic || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Description</p>
                        <p dir="rtl">{metadata.descriptionArabic || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Category</p>
                        <p dir="rtl">{metadata.categoryArabic || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Keywords</p>
                        <div className="flex flex-wrap gap-1 mt-1" dir="rtl">
                          {metadata.keywordsArabic && metadata.keywordsArabic.length > 0 ? (
                            metadata.keywordsArabic.map((keyword, index) => (
                              <Badge key={index} variant="secondary">{keyword}</Badge>
                            ))
                          ) : (
                            <p>Not provided</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Language</p>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <p>{metadata.language || 'Not specified'}</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">No metadata available for this dataset</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>Columns</CardTitle>
          </div>
          <CardDescription>
            This dataset contains {dataset.columns.length} columns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {columnChunks.map((chunk, chunkIndex) => (
              <div key={chunkIndex} className="space-y-2">
                {chunk.map((column, columnIndex) => (
                  <Badge key={columnIndex} variant="outline" className="text-xs py-1 px-2 font-mono">
                    {column}
                  </Badge>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {isPendingReview && latestVersion && (
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
                {dataset.versions.map((version: Version) => (
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
    </div>
  );
} 