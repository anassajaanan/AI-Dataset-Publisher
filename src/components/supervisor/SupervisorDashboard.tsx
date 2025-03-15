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
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('review');

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        setLoading(true);
        const url = activeTab === 'all' 
          ? '/api/datasets' 
          : `/api/datasets?status=${activeTab}`;
        
        const response = await axios.get(url);
        console.log('API Response:', response.data);
        setDatasets(response.data.datasets || []);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching datasets:', err);
        setError('Failed to load datasets. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDatasets();
  }, [activeTab]);

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
                          <span>Approved on {formatDate(dataset.updatedAt)}</span>
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
                    
                    {dataset.versions && dataset.versions.length > 0 && dataset.versions[0].comments && (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground font-medium mb-1">Rejection Reason:</p>
                        <p className="text-sm line-clamp-2">
                          {dataset.versions[0].comments}
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