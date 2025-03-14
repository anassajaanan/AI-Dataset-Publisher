"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter,
  CardDescription 
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
  Globe,
  Info,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DatasetPageProps {
  params: {
    id: string;
  };
}

export default function DatasetPage({ params }: DatasetPageProps) {
  const [activeTab, setActiveTab] = useState<'english' | 'arabic'>('english');
  
  // Fetch dataset data
  const [dataset, setDataset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Extract id from params to use in the dependency array
  const datasetId = params.id;
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!datasetId) {
          throw new Error('Dataset ID is required');
        }
        
        const response = await fetch(`/api/datasets/${datasetId}`);
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
  }, [datasetId]);
  
  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading dataset information...</p>
        </div>
      </div>
    );
  }
  
  if (error || !dataset) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error || 'Dataset not found'}</AlertDescription>
          </Alert>
          <Button asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  const latestVersion = dataset.versions[0];
  const metadata = dataset.metadata;
  
  // Map metadata properties to UI-friendly format if metadata exists
  const formattedMetadata = metadata ? {
    title: metadata.title,
    titleArabic: metadata.titleArabic,
    description: metadata.description,
    descriptionArabic: metadata.descriptionArabic,
    tags: metadata.keywords || [],
    category: metadata.license || 'General'
  } : null;
  
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
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Pencil className="h-4 w-4" />;
      case 'submitted': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle2 className="h-4 w-4" />;
      case 'rejected': return <AlertCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
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
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{dataset.filename}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={getStatusVariant(latestVersion.status)} className="flex items-center gap-1">
                {getStatusIcon(latestVersion.status)}
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
            {!formattedMetadata ? (
              <Button asChild className="shadow-sm">
                <Link href={`/datasets/${dataset._id}/metadata`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Add Metadata
                </Link>
              </Button>
            ) : (
              <Button variant="outline" asChild>
                <Link href={`/datasets/${dataset._id}/metadata`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Metadata
                </Link>
              </Button>
            )}
            
            {latestVersion.status === 'draft' && (
              <Button asChild className={!formattedMetadata ? "opacity-50 cursor-not-allowed" : "shadow-sm"} disabled={!formattedMetadata}>
                <Link href={formattedMetadata ? `/datasets/${dataset._id}/submit` : "#"}>
                  <Send className="h-4 w-4 mr-2" />
                  Submit for Review
                </Link>
              </Button>
            )}
          </div>
        </div>
        
        {!formattedMetadata && (
          <Alert className="bg-amber-50 border-amber-200 text-amber-800">
            <Info className="h-4 w-4 text-amber-800" />
            <AlertTitle>Metadata Required</AlertTitle>
            <AlertDescription>
              Please add metadata to your dataset before submitting it for review. Metadata helps users discover and understand your dataset.
            </AlertDescription>
          </Alert>
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
        
        {formattedMetadata ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  <CardTitle>Metadata</CardTitle>
                </div>
                <div className="flex border rounded-md overflow-hidden">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={`relative px-4 py-2 rounded-none ${activeTab === 'english' ? 'bg-primary/10 text-primary' : ''}`}
                    onClick={() => setActiveTab('english')}
                  >
                    English
                  </Button>
                  
                  {formattedMetadata.titleArabic && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={`relative px-4 py-2 rounded-none ${activeTab === 'arabic' ? 'bg-primary/10 text-primary' : ''}`}
                      onClick={() => setActiveTab('arabic')}
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Arabic
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* English Metadata */}
              {activeTab === 'english' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Title</h3>
                      <p className="text-lg font-medium">{formattedMetadata.title}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Category</h3>
                      <Badge variant="secondary" className="text-sm font-normal">
                        {formattedMetadata.category}
                      </Badge>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {formattedMetadata.tags && formattedMetadata.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="outline" className="bg-primary/5">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                    <p className="text-foreground whitespace-pre-line">{formattedMetadata.description}</p>
                  </div>
                </div>
              )}
              
              {/* Arabic Metadata */}
              {activeTab === 'arabic' && formattedMetadata.titleArabic && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" dir="rtl">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">العنوان</h3>
                      <p className="text-lg font-medium">{formattedMetadata.titleArabic}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">الفئة</h3>
                      <Badge variant="secondary" className="text-sm font-normal">
                        {formattedMetadata.category}
                      </Badge>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">الكلمات المفتاحية</h3>
                      <div className="flex flex-wrap gap-2">
                        {formattedMetadata.tags && formattedMetadata.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="outline" className="bg-primary/5">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">الوصف</h3>
                    <p className="text-foreground whitespace-pre-line">{formattedMetadata.descriptionArabic}</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-end">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/datasets/${dataset._id}/metadata`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Metadata
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="border-2 border-dashed border-primary/20">
            <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center text-center">
              <Tag className="h-12 w-12 text-primary/60 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Metadata Available</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Metadata helps users discover and understand your dataset. Add metadata to improve visibility and usability.
              </p>
              <Button asChild size="lg" className="shadow-sm">
                <Link href={`/datasets/${dataset._id}/metadata`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Add Metadata
                </Link>
              </Button>
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
                  {dataset.versions.map((version: any) => (
                    <tr key={version._id ? version._id.toString() : `version-${version.versionNumber}`} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{version.versionNumber}</td>
                      <td className="py-3 px-4">{formatDate(version.createdAt)}</td>
                      <td className="py-3 px-4">
                        <Badge variant={getStatusVariant(version.status)} className="flex items-center gap-1 w-fit">
                          {getStatusIcon(version.status)}
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
    </div>
  );
} 