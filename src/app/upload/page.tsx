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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-muted/40">
            <CardHeader className="space-y-1">
              <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center mb-1">
                <FileUp className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base">Step 1: Upload</CardTitle>
              <CardDescription>
                Upload your CSV or Excel file
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="space-y-1">
              <div className="bg-muted w-10 h-10 rounded-full flex items-center justify-center mb-1">
                <FileCheck className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardTitle className="text-base">Step 2: Review</CardTitle>
              <CardDescription>
                Review AI-generated metadata
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="space-y-1">
              <div className="bg-muted w-10 h-10 rounded-full flex items-center justify-center mb-1">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardTitle className="text-base">Step 3: Submit</CardTitle>
              <CardDescription>
                Submit for review and publishing
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <UploadWorkflow />

        <div className="bg-muted/30 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-medium mb-3">Tips for a successful upload</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Ensure your dataset is in CSV or Excel format (.csv, .xls, .xlsx)</li>
            <li>• Make sure your file has headers in the first row</li>
            <li>• Clean your data before uploading for better metadata generation</li>
            <li>• Maximum file size is 10MB</li>
            <li>• For larger datasets, consider splitting into multiple files</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 