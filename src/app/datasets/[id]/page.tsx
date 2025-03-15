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
import NewVersionDialog from '@/components/datasets/NewVersionDialog';

interface DatasetPageProps {
  params: {
    id: string;
  };
}

interface DatasetVersion {
  _id: string;
  versionNumber: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdAt: string;
  comments?: string;
}

interface DatasetType {
  _id: string;
  filename: string;
  fileSize: number;
  rowCount: number;
  columns: string[];
  versions: DatasetVersion[]; // Always an array
  metadata?: {
    title: string;
    titleArabic?: string;
    description: string;
    descriptionArabic?: string;
    keywords: string[];
    keywordsArabic?: string[];
    category: string;
    categoryArabic?: string;
    language: 'en' | 'ar' | 'both';
  };
  createdAt: string;
}

export default function DatasetPage({ params }: DatasetPageProps) {
  const [activeTab, setActiveTab] = useState<'english' | 'arabic'>('english');
  
  // Get dataset ID from params
  const datasetId = params.id;
  
  // Fetch dataset data
  const [dataset, setDataset] = useState<DatasetType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/datasets/${datasetId}`);
        if (!response.ok) throw new Error('Failed to fetch dataset');
        
        const { dataset } = await response.json();
        
        if (!dataset) throw new Error('Dataset not found');
        if (!dataset.versions || dataset.versions.length === 0) {
          throw new Error('Dataset has no versions');
        }

        setDataset(dataset);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
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
  
  // Get latest version safely
  const latestVersion = dataset?.versions?.reduce((latest: DatasetVersion, current: DatasetVersion) => 
    current.versionNumber > latest.versionNumber ? current : latest, 
    { versionNumber: -1 } as DatasetVersion
  );
  
  // Fallback UI for missing versions
  if (dataset && (!dataset.versions || dataset.versions.length === 0)) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Invalid Dataset</AlertTitle>
        <AlertDescription>This dataset has no valid versions</AlertDescription>
      </Alert>
    );
  }
  
  const metadata = dataset.metadata;
  
  // First, add a function to get keyword badge colors
  const getKeywordBadgeColor = (index: number) => {
    const colors = [
      'bg-blue-50 text-blue-600 border-blue-100',
      'bg-purple-50 text-purple-600 border-purple-100',
      'bg-pink-50 text-pink-600 border-pink-100',
      'bg-indigo-50 text-indigo-600 border-indigo-100',
      'bg-emerald-50 text-emerald-600 border-emerald-100',
      'bg-amber-50 text-amber-600 border-amber-100',
      'bg-cyan-50 text-cyan-600 border-cyan-100',
      'bg-rose-50 text-rose-600 border-rose-100',
    ];
    return colors[index % colors.length];
  };
  
  // Modify the metadataItems array to handle keywords differently
  const metadataItems = dataset?.metadata ? [
    {
      icon: <FileText className="h-4 w-4" />,
      label: 'Title',
      value: dataset.metadata.title,
      valueArabic: dataset.metadata.titleArabic
    },
    {
      icon: <Info className="h-4 w-4" />,
      label: 'Description',
      value: dataset.metadata.description,
      valueArabic: dataset.metadata.descriptionArabic
    },
    {
      icon: <Tag className="h-4 w-4" />,
      label: 'Category',
      value: dataset.metadata.category,
      valueArabic: dataset.metadata.categoryArabic
    },
    {
      icon: <Database className="h-4 w-4" />,
      label: 'Keywords',
      value: dataset.metadata.keywords,
      valueArabic: dataset.metadata.keywordsArabic,
      isKeywords: true
    }
  ] : [];
  
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Button variant="ghost" size="sm" asChild className="gap-1 pl-0 hover:pl-1 transition-all -ml-2">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
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
            {!metadata ? (
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
              <Button asChild className={!metadata ? "opacity-50 cursor-not-allowed" : "shadow-sm"} disabled={!metadata}>
                <Link href={metadata ? `/datasets/${dataset._id}/submit` : "#"}>
                  <Send className="h-4 w-4 mr-2" />
                  Submit for Review
                </Link>
              </Button>
            )}
          </div>
        </div>
        
        {!metadata && (
          <Alert className="bg-amber-50 border-amber-200 text-amber-800 mb-6">
            <Info className="h-4 w-4 text-amber-800" />
            <AlertTitle>Metadata Required</AlertTitle>
            <AlertDescription>
              Please add metadata to your dataset before submitting it for review. Metadata helps users discover and understand your dataset.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <Card className="md:col-span-4 border border-muted/60 shadow-sm overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/80 to-blue-400/40"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-blue-500/10">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <CardTitle>File Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Filename</p>
                  <p className="font-medium truncate">{dataset.filename}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Size</p>
                  <p className="font-medium">{formatFileSize(dataset.fileSize)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Rows</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{dataset.rowCount.toLocaleString()}</p>
                    <BarChart2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Columns</p>
                  <p className="font-medium">{dataset.columns.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-8 border border-muted/60 shadow-sm overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/80 to-emerald-400/40"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-emerald-500/10">
                    <Database className="h-5 w-5 text-emerald-500" />
                  </div>
                  <CardTitle>Columns</CardTitle>
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  {dataset.columns.length} total
                </Badge>
              </div>
              <CardDescription className="mt-1">
                The dataset contains the following columns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <div className="max-h-[400px] overflow-y-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b">
                        <th className="w-12 px-4 py-2 text-left text-xs font-medium text-muted-foreground">#</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Column Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataset.columns.map((column: string, index: number) => (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                          <td className="w-12 px-4 py-2 border-b border-slate-100 text-xs text-muted-foreground font-medium">
                            {index + 1}
                          </td>
                          <td className="px-4 py-2 border-b border-slate-100 text-sm font-medium">
                            {column}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {metadata ? (
          <Card className="border border-muted/60 shadow-sm overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/80 to-primary/40"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <Tag className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Metadata</CardTitle>
                </div>
                {metadata.language === 'both' && (
                  <div className="flex border rounded-md overflow-hidden">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={`relative px-4 py-1.5 rounded-none ${activeTab === 'english' ? 'bg-primary/10 text-primary font-medium' : ''}`}
                      onClick={() => setActiveTab('english')}
                    >
                      English
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={`relative px-4 py-1.5 rounded-none ${activeTab === 'arabic' ? 'bg-primary/10 text-primary font-medium' : ''}`}
                      onClick={() => setActiveTab('arabic')}
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Arabic
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* English Metadata */}
              {(metadata.language === 'en' || (metadata.language === 'both' && activeTab === 'english')) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {metadataItems.map((item, index) => (
                    <div key={index} className={`${item.isKeywords ? 'md:col-span-2' : ''}`}>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                        <div className="p-1 rounded-full bg-primary/5">
                          {item.icon}
                        </div>
                        {item.label}
                      </h3>
                      {item.isKeywords ? (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {item.value.map((keyword: string, idx: number) => (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              className={`${getKeywordBadgeColor(idx)} text-xs px-2.5 py-0.5 rounded-full font-normal hover:shadow-sm transition-shadow`}
                            >
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-base">{item.value}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Arabic Metadata */}
              {(metadata.language === 'ar' || (metadata.language === 'both' && activeTab === 'arabic')) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir="rtl">
                  {metadataItems.map((item, index) => (
                    <div key={index} className={`${item.isKeywords ? 'md:col-span-2' : ''}`}>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                        <div className="p-1 rounded-full bg-primary/5">
                          {item.icon}
                        </div>
                        {item.label}
                      </h3>
                      {item.isKeywords ? (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {(item.valueArabic || item.value).map((keyword: string, idx: number) => (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              className={`${getKeywordBadgeColor(idx)} text-xs px-2.5 py-0.5 rounded-full font-normal hover:shadow-sm transition-shadow`}
                            >
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-base">{item.valueArabic || item.value}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <Separator className="my-0" />
            <CardFooter className="pt-3 pb-3 flex justify-end">
              <Button variant="outline" size="sm" asChild className="shadow-sm">
                <Link href={`/datasets/${dataset._id}/metadata`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Metadata
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="border-2 border-dashed border-primary/20 bg-primary/[0.03]">
            <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center text-center">
              <Tag className="h-10 w-10 text-primary/60 mb-3" />
              <h3 className="text-xl font-semibold mb-1.5">No Metadata Available</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
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
        
        <Card className="mt-6 border border-muted/60 shadow-sm overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/80 to-indigo-400/40"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-indigo-500/10">
                <Calendar className="h-5 w-5 text-indigo-500" />
              </div>
              <CardTitle>Version History</CardTitle>
            </div>
            {latestVersion && latestVersion.status === 'draft' && (
              <NewVersionDialog 
                datasetId={datasetId} 
                onSuccess={() => {
                  // Reload the dataset data
                  setLoading(true);
                  fetch(`/api/datasets/${datasetId}`)
                    .then(response => {
                      if (!response.ok) throw new Error('Failed to fetch dataset');
                      return response.json();
                    })
                    .then(data => {
                      setDataset(data.dataset);
                    })
                    .catch(err => {
                      setError(err instanceof Error ? err.message : 'An unknown error occurred');
                    })
                    .finally(() => {
                      setLoading(false);
                    });
                }}
              />
            )}
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Version</th>
                    <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {dataset.versions.map((version: any) => (
                    <tr key={version._id ? version._id.toString() : `version-${version.versionNumber}`} className="border-b hover:bg-muted/50">
                      <td className="py-2.5 px-4 font-medium">{version.versionNumber}</td>
                      <td className="py-2.5 px-4">{formatDate(version.createdAt)}</td>
                      <td className="py-2.5 px-4">
                        <Badge variant={getStatusVariant(version.status)} className="flex items-center gap-1 w-fit">
                          {getStatusIcon(version.status)}
                          {getStatusLabel(version.status)}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-4">{version.comments || '-'}</td>
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