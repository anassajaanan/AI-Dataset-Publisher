"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Upload, AlertCircle, FileType, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatBytes } from "@/lib/utils";

export default function UploadWorkflow() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedDataset, setUploadedDataset] = useState<{ id: string; name: string } | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      
      // Check file type
      const validTypes = [
        'text/csv', 
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!validTypes.includes(selectedFile.type)) {
        setError("Please upload a CSV or Excel file (.csv, .xls, .xlsx)");
        return;
      }
      
      // Check file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size exceeds the 10MB limit");
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    multiple: false
  });

  const uploadFile = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 500);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload file');
      }

      setUploadProgress(100);
      
      const data = await response.json();
      setUploadedDataset({
        id: data.datasetId,
        name: file.name
      });
      
      // Wait a moment to show 100% progress
      setTimeout(() => {
        router.push(`/datasets/${data.datasetId}`);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const cancelUpload = () => {
    setFile(null);
    setUploadProgress(0);
    setError(null);
  };

  return (
    <Card className="border-2 border-dashed">
      <CardContent className="p-6">
        {!file ? (
          <div 
            {...getRootProps()} 
            className={`
              flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
              transition-colors duration-200 cursor-pointer
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-lg">Drag & drop your file here</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Upload your CSV or Excel file (.csv, .xls, .xlsx) to get started.
                  <br />Maximum file size: 10MB
                </p>
              </div>
              <Button variant="outline" type="button">
                Select File
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex items-start space-x-4">
              <div className="p-2 rounded-md bg-primary/10 text-primary">
                <FileType className="h-8 w-8" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{file.name}</h3>
                  {uploadedDataset && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      <span className="text-sm">Uploaded</span>
                    </div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatBytes(file.size)} • {file.type.split('/')[1].toUpperCase()}
                </div>
                
                {uploading && (
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              {!uploading && !uploadedDataset && (
                <Button variant="outline" onClick={cancelUpload}>
                  Cancel
                </Button>
              )}
              
              {!uploading && !uploadedDataset ? (
                <Button onClick={uploadFile}>
                  Upload File
                </Button>
              ) : uploadedDataset ? (
                <Button onClick={() => router.push(`/datasets/${uploadedDataset.id}`)}>
                  Continue to Metadata
                </Button>
              ) : (
                <Button disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 