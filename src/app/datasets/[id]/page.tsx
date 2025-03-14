import React from 'react';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
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
  Send
} from 'lucide-react';

const prisma = new PrismaClient();

export const metadata = {
  title: 'Dataset Details - Dataset Publishing Platform',
  description: 'View dataset details and metadata',
};

interface DatasetPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getDataset(id: string) {
  try {
    const dataset = await prisma.dataset.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
        metadata: {
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
      },
    });
    
    return dataset;
  } catch (error) {
    console.error('Error fetching dataset:', error);
    return null;
  }
}

export default async function DatasetPage({ params }: DatasetPageProps) {
  const { id } = await params;
  const dataset = await getDataset(id);
  
  if (!dataset) {
    notFound();
  }
  
  const latestVersion = dataset.versions[0];
  const metadata = dataset.metadata[0];
  
  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'pending_review':
        return 'warning';
      case 'approved':
        return 'success';
      case 'published':
        return 'info';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };
  
  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      <div className="flex justify-between items-center">
        <Button variant="ghost" asChild className="gap-1">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{dataset.filename}</h1>
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
            <Link href={`/datasets/${dataset.id}/metadata`}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Metadata
            </Link>
          </Button>
          
          {latestVersion.status === 'draft' && (
            <Button asChild>
              <Link href={`/datasets/${dataset.id}/submit`}>
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
              {dataset.columns.map((column, index) => (
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
              <Button variant="ghost" className="relative px-4 py-2 font-medium">
                English
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
              </Button>
              {metadata.titleArabic && (
                <Button variant="ghost" className="px-4 py-2 font-medium text-muted-foreground">
                  Arabic
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Title</h3>
              <p className="text-lg font-medium">{metadata.title}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
              <p className="text-foreground">{metadata.description}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Category</h3>
              <Badge variant="secondary">{metadata.category}</Badge>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {metadata.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center">
          <CardContent className="pt-6 pb-6">
            <p className="text-muted-foreground mb-4">No metadata has been added for this dataset yet.</p>
            <Button asChild>
              <Link href={`/datasets/${dataset.id}/metadata`}>
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
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Notes</th>
                </tr>
              </thead>
              <tbody>
                {dataset.versions.map((version) => (
                  <tr key={version.id} className="border-b">
                    <td className="py-3 px-4">{version.versionNumber}</td>
                    <td className="py-3 px-4">{formatDate(version.createdAt)}</td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusVariant(version.status)}>
                        {getStatusLabel(version.status)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{version.notes || '-'}</td>
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