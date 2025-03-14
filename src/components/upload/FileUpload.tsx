"use client";

import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertCircle, Upload, FileText, X, ArrowRight, Eye, EyeOff } from "lucide-react";
import CSVPreview from "@/components/preview/CSVPreview";

interface FileStats {
  name: string;
  size: number;
  type: string;
}

export default function FileUpload() {
  const [fileStats, setFileStats] = useState<FileStats | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setErrorMessage(null);
    
    if (acceptedFiles.length === 0) {
      return;
    }

    const file = acceptedFiles[0];
    
    // Validate file type
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("Please upload a CSV or Excel file");
      return;
    }
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File size exceeds 10MB limit");
      return;
    }
    
    setFileStats({
      name: file.name,
      size: file.size,
      type: file.type,
    });
    
    setUploadedFile(file);
    
    // Auto show preview for CSV files
    if (file.type === 'text/csv') {
      setShowPreview(true);
    } else {
      setShowPreview(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!uploadedFile) return;
    
    setIsLoading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append("file", uploadedFile);
    
    try {
      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        },
      });
      
      setDatasetId(response.data.datasetId);
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Upload error:", error);
      setErrorMessage("Failed to upload file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDataset = () => {
    // Redirect to the datasets page instead of a specific dataset
    router.push('/datasets');
  };

  const resetUpload = () => {
    setFileStats(null);
    setUploadedFile(null);
    setErrorMessage(null);
    setUploadProgress(0);
    setDatasetId(null);
    setShowPreview(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getFileIcon = () => {
    if (!fileStats) return null;
    
    if (fileStats.type === 'text/csv') {
      return <FileText className="h-12 w-12 text-primary" />;
    } else {
      return <FileText className="h-12 w-12 text-green-500" />;
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="p-6 shadow-md">
        {!fileStats ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 cursor-pointer ${
              isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50"
            } ${isDragReject ? "border-red-500 bg-red-50" : ""}`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center gap-4">
              <Upload className={`h-12 w-12 ${isDragActive ? "text-primary" : "text-gray-400"}`} />
              
              {isDragActive ? (
                <p className="text-lg font-medium text-primary">Drop your file here</p>
              ) : (
                <>
                  <p className="text-lg font-medium">Drag & drop your dataset file here</p>
                  <p className="text-sm text-muted-foreground">or click to browse files</p>
                </>
              )}
              
              <div className="mt-2 text-xs text-muted-foreground">
                <p>Accepted file types: CSV, Excel (.xls, .xlsx)</p>
                <p>Maximum file size: 10MB</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Selected File</h3>
              <Button variant="ghost" size="sm" onClick={resetUpload}>
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            </div>
            
            <Separator />
            
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              {getFileIcon()}
              <div className="flex-1">
                <p className="font-medium truncate">{fileStats.name}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(fileStats.size)}</p>
              </div>
              <div className="flex gap-2">
                {fileStats.type === 'text/csv' && (
                  <Button variant="outline" size="sm" onClick={togglePreview}>
                    {showPreview ? (
                      <><EyeOff className="h-4 w-4 mr-1" /> Hide Preview</>
                    ) : (
                      <><Eye className="h-4 w-4 mr-1" /> Preview</>
                    )}
                  </Button>
                )}
                {!isLoading && !datasetId && (
                  <Button onClick={handleUpload}>
                    <Upload className="h-4 w-4 mr-2" /> Upload
                  </Button>
                )}
              </div>
            </div>
            
            {showPreview && uploadedFile && fileStats.type === 'text/csv' && (
              <div className="mt-4 border rounded-lg p-4 bg-card">
                <h4 className="text-sm font-medium mb-3">File Preview</h4>
                <CSVPreview file={uploadedFile} maxRows={5} />
              </div>
            )}
            
            {isLoading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>
        )}
        
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}
      </Card>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Upload Successful
            </DialogTitle>
            <DialogDescription>
              Your dataset has been uploaded successfully and is ready for review.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            <p className="text-sm">
              You can now view your dataset in the datasets list and proceed with the metadata review process.
            </p>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowSuccessDialog(false)}>
                Close
              </Button>
              <Button onClick={handleViewDataset}>
                View Datasets <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 