import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Search, Upload, Filter, Calendar, Database } from "lucide-react";
import connectToDatabase from "@/lib/db/mongodb";
import { Dataset, DatasetVersion } from "@/lib/db/models";

export const metadata: Metadata = {
  title: "Datasets - Dataset Publishing Platform",
  description: "Browse and manage your datasets",
};

async function getDatasets() {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Fetch datasets
    const datasets = await Dataset.find()
      .sort({ createdAt: -1 })
      .lean();
    
    // Get all dataset IDs
    const datasetIds = datasets.map(dataset => dataset._id);
    
    // Fetch latest versions for each dataset
    const versions = await DatasetVersion.find({
      datasetId: { $in: datasetIds },
    }).sort({ versionNumber: -1 }).lean();
    
    // Create a map of datasetId to its latest version
    const latestVersionMap = new Map();
    versions.forEach(version => {
      const datasetId = version.datasetId.toString();
      if (!latestVersionMap.has(datasetId)) {
        latestVersionMap.set(datasetId, version);
      }
    });
    
    // Add versions to datasets
    const datasetsWithVersions = datasets.map(dataset => {
      const datasetId = dataset._id.toString();
      const latestVersion = latestVersionMap.get(datasetId);
      return {
        ...dataset,
        _id: datasetId, // Convert ObjectId to string
        versions: latestVersion ? [latestVersion] : []
      };
    });
    
    return datasetsWithVersions;
  } catch (error) {
    console.error('Error fetching datasets:', error);
    return [];
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function getStatusColor(status: string) {
  switch (status) {
    case 'draft':
      return 'bg-yellow-100 text-yellow-800';
    case 'submitted':
      return 'bg-blue-100 text-blue-800';
    case 'published':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default async function DatasetsPage() {
  const datasets = await getDatasets();
  
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
      
      <Tabs defaultValue="all" className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="all">All Datasets</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search datasets..."
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <TabsContent value="all" className="mt-0">
          {datasets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Database className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No datasets found</h3>
                <p className="text-muted-foreground mt-1">
                  You haven't uploaded any datasets yet.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/upload">Upload Your First Dataset</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {datasets.map((dataset: any) => {
                const latestVersion = dataset.versions && dataset.versions.length > 0 
                  ? dataset.versions[0] 
                  : { status: 'draft', versionNumber: 1 };
                
                return (
                  <Card key={dataset._id} className="transition-all hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg">{dataset.filename}</CardTitle>
                        </div>
                        <Badge className={getStatusColor(latestVersion.status)}>
                          {latestVersion.status.charAt(0).toUpperCase() + latestVersion.status.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription className="pt-1">
                        {dataset.rowCount.toLocaleString()} rows • {dataset.columns.length} columns
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-4 w-4" />
                        Uploaded on {formatDate(dataset.createdAt)}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/datasets/${dataset._id}`}>
                          View Details
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="draft" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {datasets
              .filter((dataset: any) => {
                const latestVersion = dataset.versions && dataset.versions.length > 0 
                  ? dataset.versions[0] 
                  : { status: 'draft' };
                return latestVersion.status === 'draft';
              })
              .map((dataset: any) => {
                const latestVersion = dataset.versions && dataset.versions.length > 0 
                  ? dataset.versions[0] 
                  : { status: 'draft', versionNumber: 1 };
                
                return (
                  <Card key={dataset._id} className="transition-all hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg">{dataset.filename}</CardTitle>
                        </div>
                        <Badge className={getStatusColor(latestVersion.status)}>
                          {latestVersion.status.charAt(0).toUpperCase() + latestVersion.status.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription className="pt-1">
                        {dataset.rowCount.toLocaleString()} rows • {dataset.columns.length} columns
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-4 w-4" />
                        Uploaded on {formatDate(dataset.createdAt)}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/datasets/${dataset._id}`}>
                          View Details
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
          </div>
        </TabsContent>
        
        <TabsContent value="submitted" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {datasets
              .filter((dataset: any) => {
                const latestVersion = dataset.versions && dataset.versions.length > 0 
                  ? dataset.versions[0] 
                  : { status: 'draft' };
                return latestVersion.status === 'submitted';
              })
              .map((dataset: any) => {
                const latestVersion = dataset.versions && dataset.versions.length > 0 
                  ? dataset.versions[0] 
                  : { status: 'submitted', versionNumber: 1 };
                
                return (
                  <Card key={dataset._id} className="transition-all hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg">{dataset.filename}</CardTitle>
                        </div>
                        <Badge className={getStatusColor(latestVersion.status)}>
                          {latestVersion.status.charAt(0).toUpperCase() + latestVersion.status.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription className="pt-1">
                        {dataset.rowCount.toLocaleString()} rows • {dataset.columns.length} columns
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-4 w-4" />
                        Uploaded on {formatDate(dataset.createdAt)}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/datasets/${dataset._id}`}>
                          View Details
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
          </div>
        </TabsContent>
        
        <TabsContent value="published" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {datasets
              .filter((dataset: any) => {
                const latestVersion = dataset.versions && dataset.versions.length > 0 
                  ? dataset.versions[0] 
                  : { status: 'draft' };
                return latestVersion.status === 'published';
              })
              .map((dataset: any) => {
                const latestVersion = dataset.versions && dataset.versions.length > 0 
                  ? dataset.versions[0] 
                  : { status: 'published', versionNumber: 1 };
                
                return (
                  <Card key={dataset._id} className="transition-all hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg">{dataset.filename}</CardTitle>
                        </div>
                        <Badge className={getStatusColor(latestVersion.status)}>
                          {latestVersion.status.charAt(0).toUpperCase() + latestVersion.status.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription className="pt-1">
                        {dataset.rowCount.toLocaleString()} rows • {dataset.columns.length} columns
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-4 w-4" />
                        Uploaded on {formatDate(dataset.createdAt)}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/datasets/${dataset._id}`}>
                          View Details
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 