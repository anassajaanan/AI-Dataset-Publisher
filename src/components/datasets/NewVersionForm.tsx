'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertCircle, Upload, FileUp, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

interface NewVersionFormProps {
  datasetId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function NewVersionForm({ datasetId, onSuccess, onCancel }: NewVersionFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [comments, setComments] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (comments) {
        formData.append('comments', comments);
      }
      
      const response = await fetch(`/api/datasets/${datasetId}/versions`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create new version');
      }
      
      const data = await response.json();
      
      toast({
        title: 'Success',
        description: `New version ${data.version.versionNumber} created successfully`,
      });
      
      // Refresh the page or call the success callback
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating the new version');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileUp className="h-5 w-5" />
          Create New Version
        </CardTitle>
        <CardDescription>
          Upload a new file to create a new version of this dataset. The file must have the same columns as the original dataset.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">File</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="flex-1"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Accepted formats: CSV, Excel (.csv, .xls, .xlsx). Max size: 10MB.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="comments">Version Comments</Label>
              <Textarea
                id="comments"
                placeholder="Describe what's changed in this version..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                disabled={isUploading}
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isUploading}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isUploading || !file}
              className="gap-1"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Create New Version
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 