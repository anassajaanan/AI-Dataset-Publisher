'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
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
  _id?: string;
  id?: string;
  datasetId?: string;
  title?: string;
  description?: string;
  category?: string;
  keywords?: string[];
}

export function SupervisorDashboardContent() {
  const [allDatasets, setAllDatasets] = useState<Dataset[]>([]);
  const [filteredDatasets, setFilteredDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('review');

  // Fetch all datasets on initial load
  useEffect(() => {
    const fetchAllDatasets = async () => {
      try {
        setLoading(true);
        
        // Fetch all datasets without status filter
        const response = await axios.get('/api/datasets');
        console.log('All datasets received:', response.data.datasets.map((d: Dataset) => ({ 
          _id: d._id, 
          id: d.id,
          filename: d.filename,
          status: d.versions?.[0]?.status 
        })));

        // Transform datasets to match the Dataset interface
        const formattedDatasets = response.data.datasets.map((dataset: any) => {
          // Process versions to ensure status is accessible
          const processedVersions = (dataset.versions || []).map((v: any) => {
            let status = v.status;
            
            // Try to get status from _doc if direct access fails
            if (!status && v._doc && v._doc.status) {
              status = v._doc.status;
            }
            
            return {
              _id: v._id?.toString() || v.id,
              id: v.id,
              datasetId: v.datasetId,
              versionNumber: v.versionNumber || 1,
              status: status || 'draft',
              comments: v.comments,
              createdAt: v.createdAt,
              updatedAt: v.updatedAt
            };
          });
          
          return {
            _id: dataset._id?.toString() || dataset.id,
            id: dataset.id,
            filename: dataset.filename,
            fileSize: dataset.fileSize,
            rowCount: dataset.rowCount,
            columns: dataset.columns || [],
            createdAt: dataset.createdAt,
            updatedAt: dataset.updatedAt,
            versions: processedVersions,
            metadata: dataset.metadata ? {
              _id: dataset.metadata._id?.toString(),
              id: dataset.metadata.id,
              datasetId: dataset.metadata.datasetId,
              title: dataset.metadata.title,
              description: dataset.metadata.description,
              category: dataset.metadata.category,
              keywords: dataset.metadata.keywords
            } : null
          };
        });

        setAllDatasets(formattedDatasets);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching datasets:', err);
        setError('Failed to load datasets. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllDatasets();
  }, []);

  // Filter datasets based on active tab
  useEffect(() => {
    if (allDatasets.length > 0) {
      if (activeTab === 'all') {
        setFilteredDatasets(allDatasets);
      } else {
        const filtered = allDatasets.filter(dataset => 
          dataset.versions.some(version => version.status === activeTab)
        );
        setFilteredDatasets(filtered);
      }
    }
  }, [activeTab, allDatasets]);

  // Filter datasets by status
  const pendingReview = allDatasets.filter(d => 
    d.versions.some(v => v.status === 'review')
  );
  
  const approved = allDatasets.filter(d => 
    d.versions.some(v => v.status === 'published')
  );
  
  const rejected = allDatasets.filter(d => 
    d.versions.some(v => v.status === 'rejected')
  );
  
  const formatDate = (dateString: string) => {
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
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="review" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Pending Review
          <Badge variant="secondary" className="ml-1">{pendingReview.length}</Badge>
        </TabsTrigger>
        <TabsTrigger value="published" className="flex items-center gap-2">
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
      
      <TabsContent value="review" className="space-y-4">
        {pendingReview.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No datasets pending review</p>
            </CardContent>
          </Card>
        ) : (
          pendingReview.map((dataset) => (
            <Card key={dataset._id || dataset.id} className="overflow-hidden">
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
                          <span>{dataset.rowCount?.toLocaleString() || 0} rows</span>
                          <span className="mx-1">•</span>
                          <span>Submitted on {formatDate(dataset.updatedAt)}</span>
                        </div>
                        {dataset.versions && dataset.versions.length > 0 && 
                          getStatusBadge(dataset.versions[0].status)}
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
                      <Link href={`/supervisor/review/${dataset._id || dataset.id}`}>
                        Review Dataset
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/datasets/${dataset._id || dataset.id}`}>
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
      
      <TabsContent value="published" className="space-y-4">
        {approved.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No approved datasets</p>
            </CardContent>
          </Card>
        ) : (
          approved.map((dataset) => (
            <Card key={dataset._id || dataset.id} className="overflow-hidden">
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
                          <span>{dataset.rowCount?.toLocaleString() || 0} rows</span>
                          <span className="mx-1">•</span>
                          <span>Published on {formatDate(dataset.updatedAt)}</span>
                        </div>
                        {dataset.versions && dataset.versions.length > 0 && 
                          getStatusBadge(dataset.versions[0].status)}
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
                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/datasets/${dataset._id || dataset.id}`}>
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
      
      <TabsContent value="rejected" className="space-y-4">
        {rejected.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No rejected datasets</p>
            </CardContent>
          </Card>
        ) : (
          rejected.map((dataset) => (
            <Card key={dataset._id || dataset.id} className="overflow-hidden">
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
                          <span>{dataset.rowCount?.toLocaleString() || 0} rows</span>
                          <span className="mx-1">•</span>
                          <span>Rejected on {formatDate(dataset.updatedAt)}</span>
                        </div>
                        {dataset.versions && dataset.versions.length > 0 && 
                          getStatusBadge(dataset.versions[0].status)}
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
                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/datasets/${dataset._id || dataset.id}`}>
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
    </Tabs>
  );
}