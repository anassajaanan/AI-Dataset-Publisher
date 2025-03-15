import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Upload, Database, Brain, BookOpen, CheckCircle } from "lucide-react";
import { Hero } from "@/components/ui/animated-hero";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      {/* Hero Section */}
      <Hero />

      <Separator />

      {/* Features Section */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Key Features</h2>
          <p className="text-muted-foreground mt-2">Discover what makes our platform unique</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="space-y-1">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Upload Datasets</CardTitle>
              <CardDescription>
                Easily upload your datasets in various formats including CSV and Excel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Our platform supports drag-and-drop functionality, making it simple to upload your data files.
                We handle the processing and validation automatically.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" asChild className="gap-1">
                <Link href="/upload">
                  Upload Now <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="transition-all hover:shadow-md">
            <CardHeader className="space-y-1">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>AI-Powered Metadata</CardTitle>
              <CardDescription>
                Let our AI analyze your dataset and generate comprehensive metadata.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Our advanced AI algorithms automatically extract key information from your datasets,
                saving you time and ensuring consistent documentation.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" asChild className="gap-1">
                <Link href="/about">
                  Learn More <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="transition-all hover:shadow-md">
            <CardHeader className="space-y-1">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Publishing Workflow</CardTitle>
              <CardDescription>
                Streamlined process for reviewing and publishing your datasets.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Our structured workflow guides you through the process of documenting,
                reviewing, and publishing your datasets with minimal friction.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" asChild className="gap-1">
                <Link href="/docs">
                  View Documentation <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <Separator />

      {/* How It Works Section */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="text-muted-foreground mt-2">Get started in just a few simple steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center relative">
              <Upload className="h-8 w-8 text-primary" />
              <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">1</div>
            </div>
            <h3 className="text-xl font-medium">Upload Dataset</h3>
            <p className="text-sm text-muted-foreground">
              Upload your dataset in CSV or Excel format using our simple drag-and-drop interface.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center relative">
              <Brain className="h-8 w-8 text-primary" />
              <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">2</div>
            </div>
            <h3 className="text-xl font-medium">Review Metadata</h3>
            <p className="text-sm text-muted-foreground">
              Our AI analyzes your dataset and generates metadata. Review and make any necessary adjustments.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center relative">
              <BookOpen className="h-8 w-8 text-primary" />
              <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">3</div>
            </div>
            <h3 className="text-xl font-medium">Submit for Review</h3>
            <p className="text-sm text-muted-foreground">
              Submit your dataset with complete metadata for review by our team of experts.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center relative">
              <CheckCircle className="h-8 w-8 text-primary" />
              <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">4</div>
            </div>
            <h3 className="text-xl font-medium">Publish</h3>
            <p className="text-sm text-muted-foreground">
              Once approved, your dataset is published and made available to the research community.
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <Button asChild size="lg">
            <Link href="/upload">
              Start Publishing Your Dataset
            </Link>
          </Button>
        </div>
      </section>

      <Separator />

      {/* CTA Section */}
      <section className="bg-primary/5 rounded-xl p-8 md:p-12">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Share Your Research Data?</h2>
          <p className="text-lg">
            Join researchers worldwide who are using our platform to make their datasets discoverable,
            accessible, and citable.
          </p>
          <Button asChild size="lg" className="mt-4">
            <Link href="/upload">
              Upload Your First Dataset
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
