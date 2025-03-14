'use client';

import React, { useState } from 'react';
import { FileStats } from '@/lib/services/fileProcessingService';
import Link from 'next/link';
import DataTablePreview from './DataTablePreview';
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
  FileText, 
  Database, 
  Table, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  BarChart2
} from 'lucide-react';

interface FilePreviewProps {
  fileStats: FileStats;
  datasetId: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({ fileStats, datasetId }) => {
  const [showDataPreview, setShowDataPreview] = useState<boolean>(true);
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Function to determine badge color based on file type
  const getFileTypeBadge = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    
    switch (extension) {
      case 'csv':
        return 'success';
      case 'xlsx':
      case 'xls':
        return 'info';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-primary/5 pb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>File Information</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Filename</h3>
              <div className="flex items-center gap-2">
                <p className="text-lg font-medium">{fileStats.filename}</p>
                <Badge variant={getFileTypeBadge(fileStats.filename)}>
                  {fileStats.filename.split('.').pop()?.toUpperCase()}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">File Size</h3>
              <p className="text-lg font-medium">{formatFileSize(fileStats.fileSize)}</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Row Count</h3>
              <div className="flex items-center gap-2">
                <p className="text-lg font-medium">{fileStats.rowCount.toLocaleString()}</p>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium">Columns</h3>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {fileStats.columns.map((column, index) => (
                <Badge 
                  key={index} 
                  variant="outline"
                  className="bg-primary/5 hover:bg-primary/10 text-foreground border-primary/20"
                >
                  {column}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t bg-muted/10 p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDataPreview(!showDataPreview)}
            className="flex items-center gap-1"
          >
            <Table className="h-4 w-4 mr-1" />
            {showDataPreview ? 'Hide Data Preview' : 'Show Data Preview'}
            {showDataPreview ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          
          <Button asChild variant="default" size="sm">
            <Link href={`/datasets/${datasetId}`}>
              <ExternalLink className="h-4 w-4 mr-1" />
              View Dataset Details
            </Link>
          </Button>
        </CardFooter>
      </Card>
      
      {showDataPreview && (
        <Card>
          <CardHeader className="bg-primary/5 pb-4">
            <div className="flex items-center gap-2">
              <Table className="h-5 w-5 text-primary" />
              <CardTitle>Data Preview</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTablePreview datasetId={datasetId} maxRows={10} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FilePreview; 