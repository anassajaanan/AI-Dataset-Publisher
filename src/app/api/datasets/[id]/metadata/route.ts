import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { Dataset, DatasetVersion, DatasetMetadata } from '@/lib/db/models';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Properly handle params in Next.js App Router
    const { id } = context.params;
    const datasetId = id;
    
    // Find the latest metadata for this dataset
    const metadata = await DatasetMetadata.findOne({ datasetId })
      .sort({ updatedAt: -1 });
    
    if (!metadata) {
      return NextResponse.json(
        { message: 'No metadata found for this dataset' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ metadata });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching metadata' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Properly handle params in Next.js App Router
    const { id } = context.params;
    const datasetId = id;
    
    // Parse request body
    const body = await request.json();
    const { metadata } = body;
    
    // Validate required fields - allow either English or Arabic fields to be filled
    if (metadata.language === 'ar') {
      if (!metadata.titleArabic && !metadata.title) {
        return NextResponse.json(
          { message: 'Arabic title required in either title or titleArabic' },
          { status: 400 }
        );
      }
      if (!metadata.descriptionArabic && !metadata.description) {
        return NextResponse.json(
          { message: 'Arabic description required in either description or descriptionArabic' },
          { status: 400 }
        );
      }
    }
    
    // Find the dataset
    const dataset = await Dataset.findById(datasetId);
    
    if (!dataset) {
      return NextResponse.json(
        { message: 'Dataset not found' },
        { status: 404 }
      );
    }
    
    // Find the latest version
    const latestVersion = await DatasetVersion.findOne({ datasetId: dataset._id })
      .sort({ versionNumber: -1 })
      .limit(1);
    
    // Find existing metadata
    const existingMetadata = await DatasetMetadata.findOne({
      datasetId: dataset._id,
      versionId: latestVersion?._id
    });
    
    // Convert empty strings to null for MongoDB validation
    const sanitizedMetadata = {
      title: metadata.title?.trim() || null,
      titleArabic: metadata.titleArabic?.trim() || null,
      description: metadata.description?.trim() || null,
      descriptionArabic: metadata.descriptionArabic?.trim() || null,
      tags: metadata.tags || [],
      tagsArabic: metadata.tagsArabic || metadata.tags || [],
      category: metadata.category || 'General',
      categoryArabic: metadata.categoryArabic || metadata.category || 'General',
      author: metadata.author || 'User',
      language: metadata.language || 'en'
    };
    
    console.log('Sanitized metadata for MongoDB:', sanitizedMetadata);
    
    // For Arabic-only content, ensure tags are stored in both keywords and keywordsArabic
    const arabicTags = sanitizedMetadata.language === 'ar' ? sanitizedMetadata.tags : sanitizedMetadata.tagsArabic;
    
    let updatedMetadata;
    
    try {
      if (existingMetadata) {
        // Update existing metadata
        existingMetadata.title = sanitizedMetadata.title;
        existingMetadata.titleArabic = sanitizedMetadata.titleArabic;
        existingMetadata.description = sanitizedMetadata.description;
        existingMetadata.descriptionArabic = sanitizedMetadata.descriptionArabic;
        existingMetadata.keywords = sanitizedMetadata.tags;
        existingMetadata.keywordsArabic = sanitizedMetadata.language === 'ar' ? sanitizedMetadata.tags : sanitizedMetadata.tagsArabic;
        existingMetadata.category = sanitizedMetadata.category;
        existingMetadata.categoryArabic = sanitizedMetadata.categoryArabic;
        existingMetadata.author = sanitizedMetadata.author;
        existingMetadata.language = sanitizedMetadata.language;
        
        updatedMetadata = await existingMetadata.save();
      } else {
        // Create new metadata
        updatedMetadata = await DatasetMetadata.create({
          title: sanitizedMetadata.title,
          titleArabic: sanitizedMetadata.titleArabic,
          description: sanitizedMetadata.description,
          descriptionArabic: sanitizedMetadata.descriptionArabic,
          keywords: sanitizedMetadata.tags,
          keywordsArabic: sanitizedMetadata.language === 'ar' ? sanitizedMetadata.tags : sanitizedMetadata.tagsArabic,
          category: sanitizedMetadata.category,
          categoryArabic: sanitizedMetadata.categoryArabic,
          author: sanitizedMetadata.author,
          language: sanitizedMetadata.language,
          datasetId: dataset._id,
          versionId: latestVersion?._id
        });
      }
    } catch (saveError: any) {
      console.error('Error saving metadata to MongoDB:', saveError);
      return NextResponse.json(
        { message: saveError.message || 'Failed to save metadata' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      message: 'Metadata updated successfully',
      metadata: updatedMetadata,
    });
  } catch (error) {
    console.error('Error updating metadata:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating metadata' },
      { status: 500 }
    );
  }
} 