"use client";

import React, { useState } from 'react';
import { MetadataOptionType } from '@/lib/services/ai/metadataGenerator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Sparkles, Tag, FileText, Database } from 'lucide-react';
import { HighlightGroup, HighlighterItem, Particles } from '@/components/ui/highlighter';

interface MetadataCardCarouselProps {
  options: MetadataOptionType[];
  onSelect: (index: number) => void;
  selectedIndex: number | null;
}

export const MetadataCardCarousel: React.FC<MetadataCardCarouselProps> = ({
  options,
  onSelect,
  selectedIndex
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!options || options.length === 0) {
    return null;
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
  };

  const currentOption = options[currentIndex];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Select a Metadata Option</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} of {options.length}
          </span>
        </div>
      </div>

      <HighlightGroup className="group w-full">
        <div className="group/item w-full">
          <HighlighterItem className="rounded-3xl">
            <div className="relative z-20 overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-black">
              <Particles
                className="absolute inset-0 -z-10 opacity-10 transition-opacity duration-1000 ease-in-out group-hover/item:opacity-100"
                quantity={100}
                color={"#555555"}
                vy={-0.2}
              />
              
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left side - Metadata content */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold">{currentOption.title}</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                        <p className="text-muted-foreground">{currentOption.description}</p>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground mt-1" />
                        <div className="flex flex-wrap gap-1">
                          {currentOption.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Database className="h-4 w-4 text-muted-foreground mt-1" />
                        <p className="text-sm text-muted-foreground">Category: <span className="font-medium">{currentOption.category}</span></p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right side - Decorative elements */}
                  <div className="hidden md:flex md:w-1/3 items-center justify-center">
                    <div className="relative h-32 w-32">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="h-12 w-12 text-primary/30" />
                      </div>
                      <div className="absolute -top-4 right-0 rounded-full bg-primary/10 px-2 py-1 text-xs">
                        AI Generated
                      </div>
                      <div className="absolute -bottom-2 left-0 rounded-full bg-primary/10 px-2 py-1 text-xs">
                        Metadata
                      </div>
                      <div className="absolute top-1/2 -right-4 rounded-full bg-primary/10 px-2 py-1 text-xs">
                        Option {currentIndex + 1}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer with pagination and selection */}
              <div className="flex items-center justify-between border-t p-4 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handlePrevious}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleNext}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button 
                  onClick={() => onSelect(currentIndex)}
                  variant={selectedIndex === currentIndex ? "default" : "outline"}
                  className={selectedIndex === currentIndex ? "bg-primary text-primary-foreground" : ""}
                >
                  {selectedIndex === currentIndex ? "Selected" : "Select This Option"}
                </Button>
              </div>
            </div>
          </HighlighterItem>
        </div>
      </HighlightGroup>
    </div>
  );
}; 