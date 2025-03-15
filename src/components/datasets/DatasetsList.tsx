'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, Database, Upload } from "lucide-react";
import { DatasetActions } from '@/components/dashboard/DatasetActions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function getStatusColor(status: string) {
  switch (status) {
    case 'draft':
      return 'bg-yellow-100 text-yellow-800';
    case 'submitted':
      return 'bg-blue-100 text-blue-800';
    case 'published':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function DatasetsList() {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        setLoading(true);
        const url = activeTab === 'all' 
          ? '/api/datasets' 
          : `/api/datasets?status=${activeTab}`;
        
        const response = await axios.get(url);
        setDatasets(response.data.datasets);
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
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
    <div>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="all">All Datasets</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search datasets..."
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <TabsContent value={activeTab} className="mt-0">
          {datasets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Database className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No datasets found</h3>
                <p className="text-muted-foreground mt-1">
                  You haven't uploaded any datasets yet.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/upload">Upload Your First Dataset</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {datasets.map((dataset: any) => {
                const latestVersion = dataset.versions && dataset.versions.length > 0 
                  ? dataset.versions[0] 
                  : { status: 'draft', versionNumber: 1 };
                
                return (
                  <Card key={dataset._id || dataset.id} className="transition-all hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg">{dataset.filename}</CardTitle>
                        </div>
                        <Badge className={getStatusColor(latestVersion.status)}>
                          {latestVersion.status.charAt(0).toUpperCase() + latestVersion.status.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription className="pt-1">
                        {dataset.rowCount.toLocaleString()} rows • {dataset.columns.length} columns
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-4 w-4" />
                        Uploaded on {formatDate(dataset.createdAt)}
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col">
                      <DatasetActions 
                        datasetId={dataset._id || dataset.id}
                        filename={dataset.filename}
                        status={latestVersion.status}
                        variant="card"
                      />
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 