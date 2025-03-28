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
import { Label } from '@/components/ui/label';
import { LanguageSelector } from './LanguageSelector';
import { MetadataCardCarousel } from './MetadataCardCarousel';

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
    tagsArabic: [],
    category: '',
    categoryArabic: ''
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
          // Map database model to UI format
          const dbMetadata = response.data.metadata;
          setMetadata({
            title: dbMetadata.title || '',
            titleArabic: dbMetadata.titleArabic || '',
            description: dbMetadata.description || '',
            descriptionArabic: dbMetadata.descriptionArabic || '',
            tags: dbMetadata.keywords || [],
            tagsArabic: dbMetadata.keywordsArabic || dbMetadata.keywords || [],
            category: dbMetadata.category || 'General',
            categoryArabic: dbMetadata.categoryArabic || dbMetadata.category || 'General'
          });
          
          // Set language based on the metadata
          if (dbMetadata.language) {
            setLanguage(dbMetadata.language);
          } else {
            // Determine language based on which fields are filled
            const hasEnglish = dbMetadata.title && dbMetadata.description;
            const hasArabic = dbMetadata.titleArabic && dbMetadata.descriptionArabic;
            
            if (hasEnglish && hasArabic) {
              setLanguage('both');
            } else if (hasArabic) {
              setLanguage('ar');
            } else {
              setLanguage('en');
            }
          }
          
          // If metadata exists, go to editing but still require AI generation first
          if (dbMetadata.title && dbMetadata.description) {
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
      const response = await fetch('/api/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          datasetId,
          language
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate metadata');
      }
      
      const data = await response.json();
      setMetadataOptions(data.metadata);
      setStep('generated');
    } catch (error) {
      console.error('Error generating metadata:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while generating metadata');
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
      if (language === 'en') {
        setMetadata({
          title: option.title,
          titleArabic: '',
          description: option.description,
          descriptionArabic: '',
          tags: option.tags || [],
          tagsArabic: [],
          category: option.category,
          categoryArabic: ''
        });
      } else if (language === 'ar') {
        setMetadata({
          title: '',
          titleArabic: option.title,
          description: '',
          descriptionArabic: option.description,
          tags: option.tags || [],
          tagsArabic: [],
          category: option.category,
          categoryArabic: ''
        });
      } else if (language === 'both') {
        // For bilingual options, we expect titleArabic and descriptionArabic fields
        setMetadata({
          title: option.title,
          titleArabic: (option as any).titleArabic || '',
          description: option.description,
          descriptionArabic: (option as any).descriptionArabic || '',
          tags: option.tags || [],
          tagsArabic: (option as any).tagsArabic || option.tags || [],
          category: option.category,
          categoryArabic: (option as any).categoryArabic || option.category || ''
        });
      }
      
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
      // Use the selected language state instead of inferring from fields
      const metadataLanguage = language;

      // Validate based on selected language
      if (metadataLanguage === 'ar') {
        if (!metadata.titleArabic && !metadata.title) {
          setError('يجب تقديم عنوان عربي إما في الحقل العربي أو الحقل الرئيسي');
          return;
        }
        if (!metadata.descriptionArabic && !metadata.description) {
          setError('يجب تقديم وصف عربي إما في الحقل العربي أو الحقل الرئيسي');
          return;
        }
      }

      // Prepare data for API
      const dbMetadata = {
        title: metadata.title?.trim() || null,
        titleArabic: metadata.titleArabic?.trim() || null,
        description: metadata.description?.trim() || null,
        descriptionArabic: metadata.descriptionArabic?.trim() || null,
        tags: metadata.tags,
        // For Arabic-only content, use the same tags for both fields
        tagsArabic: metadataLanguage === 'ar' ? metadata.tags : (metadata.tagsArabic || metadata.tags),
        category: metadata.category || 'General',
        categoryArabic: metadata.categoryArabic || metadata.category || 'General',
        author: 'User',
        language: metadataLanguage
      };

      const response = await axios.put(`/api/datasets/${datasetId}/metadata`, {
        metadata: dbMetadata
      });
      
      if (response.data.metadata) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        if (onSave) {
          onSave(metadata);
        }
        
        // Redirect to the dataset details page after successful save
        router.push(`/datasets/${datasetId}`);
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
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Sparkles className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Generate Metadata with AI</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Our AI will analyze your dataset and generate metadata suggestions based on its contents.
            </p>
            
            <div className="w-full max-w-xl mb-6">
              <h4 className="text-sm font-medium mb-3 text-left">Select Language Option:</h4>
              <LanguageSelector 
                value={language} 
                onChange={(value) => setLanguage(value)} 
                disabled={generating}
              />
            </div>
            
            <Button 
              onClick={generateMetadata} 
              disabled={generating}
              className="gap-2"
              size="lg"
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
            <div className="flex justify-between items-center mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setStep('initial')}
              >
                Generate Again
              </Button>
            </div>
            
            <MetadataCardCarousel 
              options={metadataOptions}
              onSelect={selectOption}
              selectedIndex={selectedOptionIndex}
            />
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
                {(language === 'en' || language === 'both') && metadata.title && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Title (English):</p>
                    <CardTitle>{metadata.title}</CardTitle>
                  </div>
                )}
                
                {(language === 'ar' || language === 'both') && metadata.titleArabic && (
                  <div dir="rtl" lang="ar" className="mt-2">
                    <p className="text-sm text-muted-foreground mb-1 text-right">العنوان:</p>
                    <CardTitle className="text-right">{metadata.titleArabic}</CardTitle>
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                {(language === 'en' || language === 'both') && metadata.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description (English):</p>
                    <p>{metadata.description}</p>
                  </div>
                )}
                
                {(language === 'ar' || language === 'both') && metadata.descriptionArabic && (
                  <div dir="rtl" lang="ar">
                    <p className="text-sm text-muted-foreground mb-1 text-right">الوصف:</p>
                    <p className="text-right">{metadata.descriptionArabic}</p>
                  </div>
                )}
                
                {language === 'ar' ? (
                  <div dir="rtl" lang="ar">
                    <p className="text-sm text-muted-foreground mb-1 text-right">الكلمات المفتاحية:</p>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {metadata.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
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
                )}
                
                {language === 'ar' ? (
                  <div dir="rtl" lang="ar">
                    <p className="text-sm text-muted-foreground mb-1 text-right">الفئة:</p>
                    <p className="text-right">{metadata.category}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Category:</p>
                    <p>{metadata.category}</p>
                  </div>
                )}
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
                onClick={() => setStep('selected')}
              >
                Cancel
              </Button>
            </div>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }} 
              className="space-y-6"
            >
              {(language === 'en' || language === 'both') && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title (English)</Label>
                    <Input
                      id="title"
                      value={metadata.title || ''}
                      onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                      placeholder="Enter a title for your dataset"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (English)</Label>
                    <Textarea
                      id="description"
                      value={metadata.description || ''}
                      onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                      placeholder="Enter a description for your dataset"
                      rows={5}
                    />
                  </div>
                </div>
              )}
              
              {(language === 'ar' || language === 'both') && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="titleArabic" className="text-right block">العنوان</Label>
                    <Input
                      id="titleArabic"
                      value={metadata.titleArabic || ''}
                      onChange={(e) => setMetadata({ ...metadata, titleArabic: e.target.value })}
                      placeholder="أدخل عنوانًا لمجموعة البيانات الخاصة بك"
                      dir="rtl"
                      lang="ar"
                      className="text-right"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="descriptionArabic" className="text-right block">الوصف</Label>
                    <Textarea
                      id="descriptionArabic"
                      value={metadata.descriptionArabic || ''}
                      onChange={(e) => setMetadata({ ...metadata, descriptionArabic: e.target.value })}
                      placeholder="أدخل وصفًا لمجموعة البيانات الخاصة بك"
                      rows={5}
                      dir="rtl"
                      lang="ar"
                      className="text-right"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="categoryArabic" className="text-right block">الفئة</Label>
                    <Input
                      id="categoryArabic"
                      value={metadata.categoryArabic || ''}
                      onChange={(e) => setMetadata({ ...metadata, categoryArabic: e.target.value })}
                      placeholder="أدخل فئة لمجموعة البيانات الخاصة بك"
                      dir="rtl"
                      lang="ar"
                      className="text-right"
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {metadata.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => {
                          const newTags = [...metadata.tags];
                          newTags.splice(index, 1);
                          setMetadata({ ...metadata, tags: newTags });
                        }}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="tagInput"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && tagInput.trim()) {
                        e.preventDefault();
                        if (!metadata.tags.includes(tagInput.trim())) {
                          setMetadata({
                            ...metadata,
                            tags: [...metadata.tags, tagInput.trim()]
                          });
                        }
                        setTagInput('');
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      if (tagInput.trim() && !metadata.tags.includes(tagInput.trim())) {
                        setMetadata({
                          ...metadata,
                          tags: [...metadata.tags, tagInput.trim()]
                        });
                        setTagInput('');
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={metadata.category || ''}
                  onChange={(e) => setMetadata({ ...metadata, category: e.target.value })}
                  placeholder="Enter a category for your dataset"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={saveDraft} 
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Draft'
                  )}
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Submit'
                  )}
                </Button>
              </div>
            </form>
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