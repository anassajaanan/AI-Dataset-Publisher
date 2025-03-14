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
import { AlertCircle, Check, Loader2, Plus, X, Wand2 } from "lucide-react";
import { MetadataOptionType } from '@/lib/services/ai/enhancedMetadataGenerator';

interface EnhancedMetadataEditorProps {
  datasetId: string;
  onSave?: (metadata: any) => void;
  onSubmit?: () => void;
}

export const EnhancedMetadataEditor: React.FC<EnhancedMetadataEditorProps> = ({
  datasetId,
  onSave,
  onSubmit
}) => {
  const [language, setLanguage] = useState<'en' | 'ar' | 'both'>('en');
  const [generating, setGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('en');
  
  // State for metadata options
  const [metadataOptions, setMetadataOptions] = useState<MetadataOptionType[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [editedMetadata, setEditedMetadata] = useState<MetadataOptionType>({
    title: '',
    description: '',
    tags: [],
    category: '',
    titleArabic: '',
    descriptionArabic: ''
  });
  
  // Generate metadata options
  const generateMetadata = async () => {
    setGenerating(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/metadata/enhanced', {
        datasetId,
        language
      });
      
      if (response.data.metadata && response.data.metadata.options) {
        setMetadataOptions(response.data.metadata.options);
        // Select the first option by default
        setSelectedOption(0);
        setEditedMetadata(response.data.metadata.options[0]);
      }
    } catch (error) {
      console.error('Error generating metadata:', error);
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || 'Failed to generate metadata.');
      } else {
        setError('Failed to generate metadata. Please try again.');
      }
    } finally {
      setGenerating(false);
    }
  };
  
  // Select a metadata option
  const selectOption = (index: number) => {
    setSelectedOption(index);
    setEditedMetadata(metadataOptions[index]);
  };
  
  // Handle metadata field changes
  const handleMetadataChange = (field: keyof MetadataOptionType, value: string | string[]) => {
    setEditedMetadata(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Add a tag
  const addTag = () => {
    if (tagInput.trim() && !editedMetadata.tags.includes(tagInput.trim())) {
      handleMetadataChange('tags', [...editedMetadata.tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  // Remove a tag
  const removeTag = (tag: string) => {
    handleMetadataChange('tags', editedMetadata.tags.filter(t => t !== tag));
  };
  
  // Save metadata as draft
  const saveDraft = async () => {
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await axios.put(`/api/datasets/${datasetId}/metadata`, {
        metadata: {
          title: editedMetadata.title,
          description: editedMetadata.description,
          tags: editedMetadata.tags,
          category: editedMetadata.category,
          titleArabic: editedMetadata.titleArabic,
          descriptionArabic: editedMetadata.descriptionArabic
        }
      });
      
      if (response.data.metadata) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        if (onSave) {
          onSave(response.data.metadata);
        }
      }
    } catch (error) {
      console.error('Error saving metadata:', error);
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || 'Failed to save metadata.');
      } else {
        setError('Failed to save metadata. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    await saveDraft();
    if (onSubmit) {
      onSubmit();
    }
  };
  
  // Handle key press for tag input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Dataset Metadata</CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setLanguage(language === 'en' ? 'both' : language === 'both' ? 'ar' : 'en')}
              >
                {language === 'en' ? 'English Only' : language === 'both' ? 'English & Arabic' : 'Arabic Only'}
              </Button>
              <Button 
                onClick={generateMetadata} 
                disabled={generating}
                size="sm"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Metadata
                  </>
                )}
              </Button>
            </div>
          </div>
          <CardDescription>
            Generate and edit metadata for your dataset. The AI will suggest multiple options based on the file content.
          </CardDescription>
        </CardHeader>
        
        {error && (
          <CardContent>
            <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          </CardContent>
        )}
        
        {metadataOptions.length > 0 && selectedOption !== null ? (
          <>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {metadataOptions.map((option, index) => (
                  <Card 
                    key={index} 
                    className={`cursor-pointer transition-all ${selectedOption === index ? 'ring-2 ring-primary' : 'hover:border-primary/50'}`}
                    onClick={() => selectOption(index)}
                  >
                    <CardHeader className="p-4">
                      <CardTitle className="text-base truncate">{option.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-3">{option.description}</p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      <Badge variant="outline">{option.category}</Badge>
                      {selectedOption === index && (
                        <Badge variant="default">
                          <Check className="h-3 w-3 mr-1" />
                          Selected
                        </Badge>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              <Separator className="my-6" />
              
              <Tabs defaultValue="en" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="en">English</TabsTrigger>
                  {(language === 'ar' || language === 'both') && (
                    <TabsTrigger value="ar">Arabic</TabsTrigger>
                  )}
                </TabsList>
                
                <TabsContent value="en" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Title</label>
                    <Input 
                      value={editedMetadata.title} 
                      onChange={(e) => handleMetadataChange('title', e.target.value)}
                      placeholder="Dataset title"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Description</label>
                    <Textarea 
                      value={editedMetadata.description} 
                      onChange={(e) => handleMetadataChange('description', e.target.value)}
                      placeholder="Dataset description"
                      rows={5}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Category</label>
                    <Input 
                      value={editedMetadata.category} 
                      onChange={(e) => handleMetadataChange('category', e.target.value)}
                      placeholder="Dataset category"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {editedMetadata.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        value={tagInput} 
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add a tag"
                        onKeyDown={handleKeyPress}
                      />
                      <Button variant="outline" onClick={addTag} type="button">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                {(language === 'ar' || language === 'both') && (
                  <TabsContent value="ar" className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Title (Arabic)</label>
                      <Input 
                        value={editedMetadata.titleArabic || ''} 
                        onChange={(e) => handleMetadataChange('titleArabic', e.target.value)}
                        placeholder="عنوان مجموعة البيانات"
                        dir="rtl"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Description (Arabic)</label>
                      <Textarea 
                        value={editedMetadata.descriptionArabic || ''} 
                        onChange={(e) => handleMetadataChange('descriptionArabic', e.target.value)}
                        placeholder="وصف مجموعة البيانات"
                        rows={5}
                        dir="rtl"
                      />
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={saveDraft} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Draft'
                )}
              </Button>
              
              <div className="flex items-center gap-2">
                {saveSuccess && (
                  <span className="text-sm text-green-600 flex items-center">
                    <Check className="h-4 w-4 mr-1" />
                    Saved successfully
                  </span>
                )}
                <Button onClick={handleSubmit} disabled={isSaving}>Continue</Button>
              </div>
            </CardFooter>
          </>
        ) : (
          <CardContent className="text-center py-12">
            {generating ? (
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Generating metadata options...</p>
                <p className="text-sm text-muted-foreground mt-2">This may take a few moments</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <Wand2 className="h-8 w-8 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Click "Generate Metadata" to get AI-powered suggestions</p>
                <p className="text-sm text-muted-foreground mt-2">The AI will analyze your dataset and provide multiple options</p>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}; 