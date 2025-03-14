'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GeneratedMetadata, MetadataOptionType } from '@/lib/services/ai/metadataGenerator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Check, Loader2, Sparkles, X, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Chat } from '@/components/ui/chat';
import { ChatItem } from '@/components/ui/chat';
import { ChatAvatar } from '@/components/ui/chat';
import { ChatBubble } from '@/components/ui/chat';
import { useRouter } from 'next/navigation';

interface MetadataEditorProps {
  datasetId: string;
  onSave?: (metadata: GeneratedMetadata) => void;
  onSubmit?: () => void;
  isFileUploaded?: boolean;
}

export const MetadataEditor: React.FC<MetadataEditorProps> = ({
  datasetId,
  onSave,
  onSubmit,
  isFileUploaded = true
}) => {
  const router = useRouter();
  
  // State for metadata
  const [metadata, setMetadata] = useState<GeneratedMetadata>({
    title: '',
    titleArabic: '',
    description: '',
    descriptionArabic: '',
    tags: [],
    category: ''
  });
  
  // State for workflow
  const [step, setStep] = useState<'initial' | 'generating' | 'generated' | 'selected' | 'editing'>('initial');
  const [metadataOptions, setMetadataOptions] = useState<MetadataOptionType[]>([]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  
  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'ar' | 'both'>('both');
  const [activeTab, setActiveTab] = useState<'english' | 'arabic'>('english');
  const [tagInput, setTagInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  
  // Fetch existing metadata if available
  useEffect(() => {
    const fetchMetadata = async () => {
      if (!isFileUploaded) {
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`/api/datasets/${datasetId}/metadata`);
        if (response.data.metadata) {
          setMetadata(response.data.metadata);
          // If metadata exists, go to editing but still require AI generation first
          if (response.data.metadata.title && response.data.metadata.description) {
            setStep('editing');
          }
        }
      } catch (error) {
        console.error('Error fetching metadata:', error);
        // It's okay if there's no metadata yet
      } finally {
        setLoading(false);
      }
    };
    
    if (datasetId) {
      fetchMetadata();
    }
  }, [datasetId, isFileUploaded]);
  
  const generateMetadata = async () => {
    if (!isFileUploaded) {
      setError('Please upload a file first before generating metadata.');
      return;
    }
    
    setGenerating(true);
    setError(null);
    setMetadataOptions([]);
    setSelectedOptionIndex(null);
    setStep('generating');
    
    try {
      const response = await axios.post('/api/metadata', {
        datasetId,
        language
      });
      
      if (response.data.metadata && Array.isArray(response.data.metadata)) {
        setMetadataOptions(response.data.metadata);
        setStep('generated');
      }
    } catch (error) {
      console.error('Error generating metadata:', error);
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || 'Failed to generate metadata.');
      } else {
        setError('Failed to generate metadata. Please try again.');
      }
      setStep('initial');
    } finally {
      setGenerating(false);
    }
  };
  
  const selectOption = (index: number) => {
    if (index >= 0 && index < metadataOptions.length) {
      const option = metadataOptions[index];
      setSelectedOptionIndex(index);
      
      // Convert the selected option to the GeneratedMetadata format
      setMetadata({
        title: option.title,
        titleArabic: language === 'ar' || language === 'both' ? (option as any).titleArabic || '' : '',
        description: option.description,
        descriptionArabic: language === 'ar' || language === 'both' ? (option as any).descriptionArabic || '' : '',
        tags: option.tags || [],
        category: option.category
      });
      
      setStep('selected');
    }
  };
  
  const startEditing = () => {
    setStep('editing');
  };
  
  const saveDraft = async () => {
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await axios.put(`/api/datasets/${datasetId}/metadata`, {
        metadata
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
  
  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit();
    } else {
      router.push(`/datasets/${datasetId}`);
    }
  };
  
  const addTag = () => {
    if (tagInput.trim() && !metadata.tags.includes(tagInput.trim())) {
      setMetadata({
        ...metadata,
        tags: [...metadata.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };
  
  const removeTag = (tag: string) => {
    setMetadata({
      ...metadata,
      tags: metadata.tags.filter(t => t !== tag)
    });
  };
  
  // Render different UI based on the current step
  const renderStepContent = () => {
    if (!isFileUploaded) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Info className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Upload a File First</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Please upload your dataset file before generating metadata. Once your file is uploaded, you'll be able to generate metadata with AI.
          </p>
        </div>
      );
    }
    
    switch (step) {
      case 'initial':
        return (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Sparkles className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Generate Metadata with AI</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Our AI will analyze your dataset and generate metadata suggestions based on its contents.
            </p>
            <div className="flex gap-4 items-center mb-6">
              <select
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'ar' | 'both')}
                disabled={generating}
              >
                <option value="en">English Only</option>
                <option value="ar">Arabic Only</option>
                <option value="both">Bilingual</option>
              </select>
              <Button 
                onClick={generateMetadata} 
                disabled={generating}
                className="gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate with AI
                  </>
                )}
              </Button>
            </div>
          </div>
        );
      
      case 'generating':
        return (
          <div className="space-y-6">
            <Chat className="max-w-full mx-auto">
              <ChatItem>
                <ChatAvatar>
                  <Sparkles className="h-5 w-5" />
                </ChatAvatar>
                <ChatBubble className="bg-primary/10 text-foreground">
                  <div className="space-y-2">
                    <p>Analyzing your dataset and generating metadata...</p>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">This may take a moment</span>
                    </div>
                  </div>
                </ChatBubble>
              </ChatItem>
            </Chat>
          </div>
        );
        
      case 'generated':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Select a Metadata Option</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setStep('initial')}
              >
                Generate Again
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {metadataOptions.map((option, index) => (
                <Card 
                  key={index}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedOptionIndex === index ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => selectOption(index)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{option.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                      {option.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {option.tags.slice(0, 3).map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {option.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{option.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <p className="text-xs text-muted-foreground">Category: {option.category}</p>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        );
        
      case 'selected':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Selected Metadata</h3>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setStep('generated')}
                >
                  Choose Another
                </Button>
                <Button 
                  size="sm" 
                  onClick={startEditing}
                >
                  Edit Metadata
                </Button>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>{metadata.title}</CardTitle>
                {language === 'both' && metadata.titleArabic && (
                  <CardDescription dir="rtl" lang="ar" className="text-right">
                    {metadata.titleArabic}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description:</p>
                  <p>{metadata.description}</p>
                </div>
                
                {language === 'both' && metadata.descriptionArabic && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description (Arabic):</p>
                    <p dir="rtl" lang="ar" className="text-right">{metadata.descriptionArabic}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {metadata.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Category:</p>
                  <p>{metadata.category}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveDraft} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Draft'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
        
      case 'editing':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Edit Metadata</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setStep('initial')}
              >
                Generate New Options
              </Button>
            </div>
            
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'english' | 'arabic')}>
              <TabsList className="mb-4">
                <TabsTrigger value="english">English</TabsTrigger>
                <TabsTrigger value="arabic">Arabic</TabsTrigger>
              </TabsList>
              
              <TabsContent value="english" className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Title
                  </label>
                  <Input
                    id="title"
                    value={metadata.title}
                    onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                    placeholder="Enter dataset title"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    value={metadata.description}
                    onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                    placeholder="Enter dataset description"
                    rows={5}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="arabic" className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="titleArabic" className="text-sm font-medium">
                    Title (Arabic)
                  </label>
                  <Input
                    id="titleArabic"
                    value={metadata.titleArabic}
                    onChange={(e) => setMetadata({ ...metadata, titleArabic: e.target.value })}
                    placeholder="أدخل عنوان مجموعة البيانات"
                    dir="rtl"
                    lang="ar"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="descriptionArabic" className="text-sm font-medium">
                    Description (Arabic)
                  </label>
                  <Textarea
                    id="descriptionArabic"
                    value={metadata.descriptionArabic}
                    onChange={(e) => setMetadata({ ...metadata, descriptionArabic: e.target.value })}
                    placeholder="أدخل وصف مجموعة البيانات"
                    rows={5}
                    dir="rtl"
                    lang="ar"
                  />
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Category
              </label>
              <Input
                id="category"
                value={metadata.category}
                onChange={(e) => setMetadata({ ...metadata, category: e.target.value })}
                placeholder="Enter dataset category"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="tags" className="text-sm font-medium">
                Tags
              </label>
              <div className="flex items-center gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {metadata.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={saveDraft} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Draft'
                )}
              </Button>
              <Button onClick={handleSubmit} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </Button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {saveSuccess && (
        <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
          <Check className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Metadata saved successfully.</AlertDescription>
        </Alert>
      )}
      
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        renderStepContent()
      )}
    </div>
  );
}; 