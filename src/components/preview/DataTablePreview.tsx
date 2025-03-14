'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataTablePreviewProps {
  datasetId: string;
  maxRows?: number;
}

type PreviewData = {
  headers: string[];
  rows: (string | number | boolean | null)[][];
  totalRows: number;
};

const DataTablePreview: React.FC<DataTablePreviewProps> = ({ datasetId, maxRows = 10 }) => {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreviewData = async () => {
      if (!datasetId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`/api/datasets/${datasetId}/preview?rows=${maxRows}`);
        
        if (response.data.success) {
          setPreviewData(response.data.data);
        } else {
          setError(response.data.message || 'Failed to load preview data');
        }
      } catch (err) {
        console.error('Error fetching preview data:', err);
        setError('Failed to load preview data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPreviewData();
  }, [datasetId, maxRows]);

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
        <div className="space-y-2">
          <div className="flex gap-4">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-8 w-[120px]" />
            ))}
          </div>
          {Array(5).fill(0).map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-4">
              {Array(5).fill(0).map((_, cellIndex) => (
                <Skeleton key={cellIndex} className="h-8 w-[120px]" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 text-destructive bg-destructive/10 rounded-md">
        <AlertCircle className="h-5 w-5" />
        <div>
          <p className="font-medium">Error loading preview data</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!previewData || !previewData.headers.length) {
    return (
      <div className="flex items-center gap-2 p-4 text-amber-600 bg-amber-50 rounded-md">
        <Info className="h-5 w-5" />
        <p>No preview data available for this dataset.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="p-4 text-sm text-muted-foreground">
        Showing {previewData.rows.length} of {previewData.totalRows.toLocaleString()} rows
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {previewData.headers.map((header, index) => (
              <TableHead key={index}>
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {previewData.rows.map((row, rowIndex) => (
            <TableRow key={rowIndex} className={cn(
              rowIndex % 2 === 0 ? "bg-background" : "bg-muted/50"
            )}>
              {row.map((cell, cellIndex) => (
                <TableCell key={cellIndex}>
                  {cell !== null && cell !== undefined ? String(cell) : ''}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataTablePreview; 