'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GeneratedMetadata, MetadataOptionType } from '@/lib/services/ai/metadataGenerator';

interface MetadataEditorProps {
  datasetId: string;
  onSave?: (metadata: GeneratedMetadata) => void;
  onSubmit?: () => void;
}

export const MetadataEditor: React.FC<MetadataEditorProps> = ({
  datasetId,
  onSave,
  onSubmit
}) => {
  const [metadata, setMetadata] = useState<GeneratedMetadata>({
    title: '',
    titleArabic: '',
    description: '',
    descriptionArabic: '',
    tags: [],
    category: ''
  });
  
  // Add state for metadata options
  const [metadataOptions, setMetadataOptions] = useState<MetadataOptionType[]>([]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  
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
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`/api/datasets/${datasetId}/metadata`);
        if (response.data.metadata) {
          setMetadata(response.data.metadata);
        }
      } catch (error) {
        console.error('Error fetching metadata:', error);
        // It's okay if there's no metadata yet
      } finally {
        setLoading(false);
      }
    };
    
    fetchMetadata();
  }, [datasetId]);
  
  const generateMetadata = async () => {
    setGenerating(true);
    setError(null);
    setMetadataOptions([]);
    setSelectedOptionIndex(null);
    
    try {
      const response = await axios.post('/api/metadata', {
        datasetId,
        language
      });
      
      if (response.data.metadata && Array.isArray(response.data.metadata)) {
        setMetadataOptions(response.data.metadata);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
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
  
  const selectOption = (index: number) => {
    if (index >= 0 && index < metadataOptions.length) {
      const option = metadataOptions[index];
      setSelectedOptionIndex(index);
      
      // Convert the selected option to the GeneratedMetadata format
      setMetadata({
        title: option.title,
        titleArabic: language === 'ar' || language === 'both' ? option.title : '',
        description: option.description,
        descriptionArabic: language === 'ar' || language === 'both' ? option.description : '',
        tags: option.tags,
        category: option.category
      });
    }
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
  
  const handleSubmit = async () => {
    await saveDraft();
    if (onSubmit) {
      onSubmit();
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
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Dataset Metadata</h2>
        <div className="flex gap-2">
          <select
            className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'ar' | 'both')}
            disabled={generating}
          >
            <option value="en">English Only</option>
            <option value="ar">Arabic Only</option>
            <option value="both">Bilingual</option>
          </select>
          <button
            className="px-4 py-1 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={generateMetadata}
            disabled={generating}
          >
            {generating ? 'Generating...' : 'Generate with AI'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md" role="alert">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {saveSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md" role="alert">
          <p className="text-green-600">Metadata saved successfully!</p>
        </div>
      )}
      
      {/* Display metadata options if available */}
      {metadataOptions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Select a Metadata Option</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metadataOptions.map((option, index) => (
              <div 
                key={index}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedOptionIndex === index 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => selectOption(index)}
              >
                <h4 className="font-medium mb-2">{option.title}</h4>
                <p className="text-sm text-gray-600 mb-2 line-clamp-3">{option.description}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {option.tags.slice(0, 3).map((tag, tagIndex) => (
                    <span key={tagIndex} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                  {option.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                      +{option.tags.length - 3} more
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">Category: {option.category}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'english' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('english')}
          >
            English
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'arabic' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('arabic')}
          >
            Arabic
          </button>
        </div>
        
        {activeTab === 'english' ? (
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                id="title"
                type="text"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={metadata.title}
                onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                placeholder="Dataset title"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={metadata.description}
                onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                placeholder="Dataset description"
              />
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="titleArabic" className="block text-sm font-medium text-gray-700 mb-1">
                Title (Arabic)
              </label>
              <input
                id="titleArabic"
                type="text"
                dir="rtl"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={metadata.titleArabic || ''}
                onChange={(e) => setMetadata({ ...metadata, titleArabic: e.target.value })}
                placeholder="عنوان مجموعة البيانات"
              />
            </div>
            
            <div>
              <label htmlFor="descriptionArabic" className="block text-sm font-medium text-gray-700 mb-1">
                Description (Arabic)
              </label>
              <textarea
                id="descriptionArabic"
                rows={4}
                dir="rtl"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={metadata.descriptionArabic || ''}
                onChange={(e) => setMetadata({ ...metadata, descriptionArabic: e.target.value })}
                placeholder="وصف مجموعة البيانات"
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          id="category"
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          value={metadata.category}
          onChange={(e) => setMetadata({ ...metadata, category: e.target.value })}
        >
          <option value="">Select a category</option>
          <option value="Finance">Finance</option>
          <option value="People">People</option>
          <option value="Time Series">Time Series</option>
          <option value="Geography">Geography</option>
          <option value="Products">Products</option>
          <option value="General">General</option>
        </select>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {metadata.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center"
            >
              {tag}
              <button
                type="button"
                className="ml-2 text-gray-500 hover:text-gray-700"
                onClick={() => removeTag(tag)}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            className="flex-1 px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
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
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 rounded-r-md hover:bg-gray-300 transition-colors"
            onClick={addTag}
          >
            Add
          </button>
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <button
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          onClick={saveDraft}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Draft'}
        </button>
        <button
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          onClick={handleSubmit}
          disabled={isSaving}
        >
          Submit for Review
        </button>
      </div>
    </div>
  );
}; 