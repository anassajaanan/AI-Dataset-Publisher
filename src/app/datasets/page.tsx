import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { DatasetsList } from "@/components/datasets/DatasetsList";

export const metadata: Metadata = {
  title: "Datasets - Dataset Publishing Platform",
  description: "Browse and manage your datasets",
};

export default function DatasetsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Datasets</h1>
          <p className="text-muted-foreground mt-1">
            Browse and manage your uploaded datasets
          </p>
        </div>
        <Button asChild>
          <Link href="/upload">
            <Upload className="mr-2 h-4 w-4" /> Upload New Dataset
          </Link>
        </Button>
      </div>
      
      <DatasetsList />
    </div>
  );
} 