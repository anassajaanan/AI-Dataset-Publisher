'use client';

import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CSVPreviewProps {
  file: File;
  maxRows?: number;
}

const CSVPreview: React.FC<CSVPreviewProps> = ({ file, maxRows = 5 }) => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = maxRows;

  useEffect(() => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string;
        if (!csvData) {
          setError('Failed to read file');
          setLoading(false);
          return;
        }
        
        // Parse CSV data
        const lines = csvData.split('\n');
        if (lines.length === 0) {
          setError('File is empty');
          setLoading(false);
          return;
        }
        
        // Extract headers (first line)
        const headerLine = lines[0];
        const extractedHeaders = headerLine.split(',').map(header => header.trim().replace(/^"|"$/g, ''));
        setHeaders(extractedHeaders);
        
        // Extract rows (remaining lines)
        const dataRows = lines.slice(1)
          .filter(line => line.trim() !== '') // Skip empty lines
          .map(line => 
            line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
          );
        
        setRows(dataRows);
        setLoading(false);
      } catch (err) {
        console.error('Error parsing CSV:', err);
        setError('Failed to parse CSV file. Please check the file format.');
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('Failed to read file');
      setLoading(false);
    };
    
    reader.readAsText(file);
  }, [file]);

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-4 w-[250px] mb-4" />
        <div className="space-y-2">
          <div className="flex gap-4">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-8 w-[120px]" />
            ))}
          </div>
          {Array(3).fill(0).map((_, rowIndex) => (
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
          <p className="font-medium">Error previewing file</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (headers.length === 0 || rows.length === 0) {
    return (
      <div className="p-4 text-muted-foreground">
        No data available for preview.
      </div>
    );
  }

  // Calculate pagination
  const totalPages = Math.ceil(rows.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, rows.length);
  const currentRows = rows.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Previewing {rows.length} rows from {file.name}
      </div>
      
      <div className="overflow-x-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header, index) => (
                <TableHead key={index} className="whitespace-nowrap">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRows.map((row, rowIndex) => (
              <TableRow key={rowIndex} className={cn(
                rowIndex % 2 === 0 ? "bg-background" : "bg-muted/50"
              )}>
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex} className="whitespace-nowrap">
                    {cell || ''}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing rows {startIndex + 1}-{endIndex} of {rows.length}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CSVPreview; 