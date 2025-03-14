import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileUp, FileCheck, FileText } from "lucide-react";
import UploadWorkflow from "@/components/upload/UploadWorkflow";

export const metadata: Metadata = {
  title: "Upload Dataset - Dataset Publishing Platform",
  description: "Upload your dataset in CSV or Excel format",
};

export default function UploadPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Upload Your Dataset</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload your dataset in CSV or Excel format. Our system will process your file
            and help you generate metadata for publishing.
          </p>
        </div>

        <Separator />

        {/* Workflow Steps */}
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-10 left-0 right-0 h-1 bg-muted">
            <div className="h-full bg-primary w-1/3" />
          </div>
          
          {/* Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative">
            <Card className="bg-primary/5 border-primary">
              <CardHeader className="space-y-1">
                <div className="bg-primary w-10 h-10 rounded-full flex items-center justify-center mb-1 z-10">
                  <FileUp className="h-5 w-5 text-primary-foreground" />
                </div>
                <CardTitle className="text-base">Step 1: Upload</CardTitle>
                <CardDescription>
                  Upload your CSV or Excel file
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Drag and drop or select your file</li>
                  <li>We'll analyze the file structure</li>
                  <li>Review the file details before proceeding</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardHeader className="space-y-1">
                <div className="bg-muted w-10 h-10 rounded-full flex items-center justify-center mb-1 z-10">
                  <FileCheck className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-base">Step 2: Metadata</CardTitle>
                <CardDescription>
                  Generate and edit metadata
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Generate metadata with AI</li>
                  <li>Choose from multiple suggestions</li>
                  <li>Edit in English and Arabic</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardHeader className="space-y-1">
                <div className="bg-muted w-10 h-10 rounded-full flex items-center justify-center mb-1 z-10">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-base">Step 3: Submit</CardTitle>
                <CardDescription>
                  Submit for review and publishing
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Review all information</li>
                  <li>Add optional comments</li>
                  <li>Submit for supervisor approval</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <UploadWorkflow />

        <div className="bg-muted/30 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-medium mb-3">Tips for a successful upload</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Ensure your dataset is in CSV or Excel format (.csv, .xls, .xlsx)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Make sure your file has headers in the first row</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Clean your data before uploading for better metadata generation</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Maximum file size is 10MB</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>For larger datasets, consider splitting into multiple files</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
} 