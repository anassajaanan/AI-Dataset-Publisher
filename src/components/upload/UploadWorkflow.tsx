"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import FileUpload from "@/components/upload/FileUpload";
import { MetadataEditor } from "@/components/metadata/MetadataEditor";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

type Step = "upload" | "metadata" | "submit";

export default function UploadWorkflow() {
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const router = useRouter();

  // This function will be called when a file is successfully uploaded
  const handleFileUploaded = (id: string) => {
    setDatasetId(id);
    setCurrentStep("metadata");
  };

  // This function will be called when metadata is saved
  const handleMetadataSaved = () => {
    // You might want to do something here, like showing a success message
  };

  // This function will be called when the metadata form is submitted
  const handleMetadataSubmitted = () => {
    setCurrentStep("submit");
  };

  // This function will be called when the user wants to go back to the previous step
  const handleBack = () => {
    if (currentStep === "metadata") {
      setCurrentStep("upload");
    } else if (currentStep === "submit") {
      setCurrentStep("metadata");
    }
  };

  // This function will be called when the user wants to view the dataset
  const handleViewDataset = () => {
    if (datasetId) {
      router.push(`/datasets/${datasetId}`);
    }
  };

  // This function will be called when the user wants to go to the dashboard
  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  // Render the appropriate step
  const renderStep = () => {
    switch (currentStep) {
      case "upload":
        return (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Upload Dataset</CardTitle>
              <CardDescription>
                Drag and drop your file or click to browse. We support CSV and Excel files up to 10MB.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload onFileUploaded={handleFileUploaded} />
            </CardContent>
          </Card>
        );
      case "metadata":
        return (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Review and Edit Metadata</CardTitle>
              <CardDescription>
                Our AI has generated metadata options for your dataset. Review, select, and edit the metadata before submitting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {datasetId && (
                <MetadataEditor 
                  datasetId={datasetId} 
                  onSave={handleMetadataSaved} 
                  onSubmit={handleMetadataSubmitted} 
                />
              )}
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Upload
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      case "submit":
        return (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Submission Complete</CardTitle>
              <CardDescription>
                Your dataset has been successfully submitted for review.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-6 text-center space-y-4">
                <div className="bg-green-50 text-green-700 p-4 rounded-lg inline-block mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="mt-2 font-medium">Dataset Submitted Successfully</p>
                </div>
                <p className="text-muted-foreground">
                  Your dataset has been submitted and is now awaiting review. You can check the status of your submission in the dashboard.
                </p>
                <div className="flex justify-center gap-4 mt-6">
                  <Button variant="outline" onClick={handleViewDataset}>
                    View Dataset Details
                  </Button>
                  <Button onClick={handleGoToDashboard}>
                    Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-6 flex justify-start">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Metadata
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return <>{renderStep()}</>;
} 