"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Check, Loader2, Plus, X, Wand2, Save, ArrowRight } from "lucide-react";
import { MetadataOptionType } from '@/lib/services/ai/enhancedMetadataGenerator';

interface EnhancedMetadataEditorProps {
  datasetId: string;
  onSave?: () => void;
  onSubmit?: () => void;
}

interface MetadataOption {
  title: string;
  description: string;
  tags: string[];
  category: string;
  arabicTitle?: string;
  arabicDescription?: string;
}

export default function EnhancedMetadataEditor({ datasetId, onSave, onSubmit }: EnhancedMetadataEditorProps) {
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [metadataOptions, setMetadataOptions] = useState<MetadataOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [editedMetadata, setEditedMetadata] = useState<MetadataOption | null>(null);
  const [newTag, setNewTag] = useState<string>("");

  useEffect(() => {
    if (datasetId) {
      generateMetadataOptions();
    }
  }, [datasetId]);

  const generateMetadataOptions = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await axios.post("/api/metadata/enhanced", {
        datasetId,
        language
      });
      
      const options = response.data.metadata;
      setMetadataOptions(options);
      
      if (options.length > 0) {
        setSelectedOption(0);
        setEditedMetadata(options[0]);
      }
    } catch (error) {
      console.error("Error generating metadata:", error);
      setError("Failed to generate metadata options. Please try again.");
      
      // Fallback to simulated options for development
      const fallbackOptions = [
        {
          title: "Sample Dataset 1",
          description: "This is a sample dataset description for option 1.",
          tags: ["sample", "data", "option1"],
          category: "Research",
          arabicTitle: "مجموعة بيانات عينة 1",
          arabicDescription: "هذا وصف مجموعة بيانات عينة للخيار 1."
        },
        {
          title: "Sample Dataset 2",
          description: "This is a sample dataset description for option 2.",
          tags: ["sample", "data", "option2"],
          category: "Education",
          arabicTitle: "مجموعة بيانات عينة 2",
          arabicDescription: "هذا وصف مجموعة بيانات عينة للخيار 2."
        },
        {
          title: "Sample Dataset 3",
          description: "This is a sample dataset description for option 3.",
          tags: ["sample", "data", "option3"],
          category: "Government",
          arabicTitle: "مجموعة بيانات عينة 3",
          arabicDescription: "هذا وصف مجموعة بيانات عينة للخيار 3."
        }
      ];
      
      setMetadataOptions(fallbackOptions);
      setSelectedOption(0);
      setEditedMetadata(fallbackOptions[0]);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectMetadataOption = (index: number) => {
    setSelectedOption(index);
    setEditedMetadata(metadataOptions[index]);
  };

  const handleMetadataChange = (field: keyof MetadataOption, value: string) => {
    if (editedMetadata) {
      setEditedMetadata({
        ...editedMetadata,
        [field]: value
      });
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && editedMetadata) {
      if (!editedMetadata.tags.includes(newTag.trim())) {
        setEditedMetadata({
          ...editedMetadata,
          tags: [...editedMetadata.tags, newTag.trim()]
        });
      }
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    if (editedMetadata) {
      setEditedMetadata({
        ...editedMetadata,
        tags: editedMetadata.tags.filter(t => t !== tag)
      });
    }
  };

  const handleSaveDraft = async () => {
    if (!editedMetadata) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await axios.post(`/api/datasets/${datasetId}/metadata`, {
        metadata: editedMetadata,
        status: "draft"
      });
      
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error("Error saving metadata:", error);
      setError("Failed to save metadata. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!editedMetadata) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await axios.post(`/api/datasets/${datasetId}/metadata`, {
        metadata: editedMetadata,
        status: "submitted"
      });
      
      if (onSubmit) {
        onSubmit();
      }
    } catch (error) {
      console.error("Error submitting metadata:", error);
      setError("Failed to submit metadata. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Metadata Options</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage("en")}
              className={language === "en" ? "bg-primary/10" : ""}
            >
              English
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage("ar")}
              className={language === "ar" ? "bg-primary/10" : ""}
            >
              العربية
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {error && (
        <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <CardContent>
        {isGenerating ? (
          <div className="py-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Generating metadata options...</p>
          </div>
        ) : metadataOptions.length > 0 ? (
          <div className="space-y-6">
            <Tabs defaultValue="0" className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                {metadataOptions.map((option, index) => (
                  <TabsTrigger
                    key={index}
                    value={index.toString()}
                    onClick={() => selectMetadataOption(index)}
                  >
                    Option {index + 1}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {metadataOptions.map((option, index) => (
                <TabsContent key={index} value={index.toString()} className="pt-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">
                      {language === "en" ? option.title : option.arabicTitle || option.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {language === "en" ? option.description : option.arabicDescription || option.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {option.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Category: <span className="font-medium">{option.category}</span>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
            
            {editedMetadata && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">Edit Metadata</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      {language === "en" ? "Title" : "العنوان"}
                    </label>
                    <Input
                      value={language === "en" ? editedMetadata.title : editedMetadata.arabicTitle || ""}
                      onChange={(e) => handleMetadataChange(
                        language === "en" ? "title" : "arabicTitle",
                        e.target.value
                      )}
                      placeholder={language === "en" ? "Enter title" : "أدخل العنوان"}
                      dir={language === "ar" ? "rtl" : "ltr"}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      {language === "en" ? "Description" : "الوصف"}
                    </label>
                    <Textarea
                      value={language === "en" ? editedMetadata.description : editedMetadata.arabicDescription || ""}
                      onChange={(e) => handleMetadataChange(
                        language === "en" ? "description" : "arabicDescription",
                        e.target.value
                      )}
                      placeholder={language === "en" ? "Enter description" : "أدخل الوصف"}
                      rows={4}
                      dir={language === "ar" ? "rtl" : "ltr"}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      {language === "en" ? "Category" : "الفئة"}
                    </label>
                    <Input
                      value={editedMetadata.category}
                      onChange={(e) => handleMetadataChange("category", e.target.value)}
                      placeholder={language === "en" ? "Enter category" : "أدخل الفئة"}
                      dir={language === "ar" ? "rtl" : "ltr"}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      {language === "en" ? "Tags" : "العلامات"}
                    </label>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {editedMetadata.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="h-3 w-3 rounded-full bg-muted-foreground/30 flex items-center justify-center hover:bg-muted-foreground/50"
                          >
                            <X className="h-2 w-2" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder={language === "en" ? "Add a tag" : "أضف علامة"}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        dir={language === "ar" ? "rtl" : "ltr"}
                      />
                      <Button type="button" size="sm" onClick={handleAddTag}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
              >
                Continue <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No metadata options available.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={generateMetadataOptions}
            >
              Generate Metadata
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 