"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Upload, Database, Brain, BookOpen, CheckCircle } from "lucide-react";
import { Hero } from "@/components/ui/animated-hero";
import { DisplayCardsDemo } from "@/components/ui/display-cards-demo";
import { FeaturesSectionWithHoverEffectsDemo } from "@/components/ui/features-section-demo";
import { RainbowButton } from "@/components/ui/rainbow-button";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      {/* Hero Section */}
      <Hero />

      <Separator />

      {/* Features Section */}
      <section className="space-y-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Key Features</h2>
          <p className="text-muted-foreground mt-2">Discover what makes our platform unique</p>
        </div>

        <DisplayCardsDemo />
        
        <div className="text-center">
          <RainbowButton onClick={() => window.location.href = '/upload'}>
            Try It Now <ArrowRight className="ml-2 h-4 w-4 inline" />
          </RainbowButton>
        </div>
      </section>

      <Separator />

      {/* How It Works Section */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="text-muted-foreground mt-2">Get started in just a few simple steps</p>
        </div>

        <FeaturesSectionWithHoverEffectsDemo />

        <div className="text-center mt-12">
          <RainbowButton onClick={() => window.location.href = '/upload'}>
            Start Publishing Your Dataset <ArrowRight className="ml-2 h-4 w-4 inline" />
          </RainbowButton>
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
          <RainbowButton onClick={() => window.location.href = '/upload'} className="mt-4">
            Upload Your First Dataset <Upload className="ml-2 h-4 w-4 inline" />
          </RainbowButton>
        </div>
      </section>
    </div>
  );
}
