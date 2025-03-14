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
    
    const datasetId = context.params.id;
    
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
    
    const datasetId = context.params.id;
    const { metadata } = await request.json();
    
    // Validate required fields
    if (!metadata.title || !metadata.description) {
      return NextResponse.json(
        { message: 'Title and description are required' },
        { status: 400 }
      );
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
    
    let updatedMetadata;
    
    if (existingMetadata) {
      // Update existing metadata
      existingMetadata.title = metadata.title;
      existingMetadata.titleArabic = metadata.titleArabic;
      existingMetadata.description = metadata.description;
      existingMetadata.descriptionArabic = metadata.descriptionArabic;
      existingMetadata.keywords = metadata.tags || [];
      existingMetadata.license = metadata.license || 'CC BY 4.0';
      existingMetadata.author = metadata.author || 'User Updated';
      
      updatedMetadata = await existingMetadata.save();
    } else {
      // Create new metadata
      updatedMetadata = await DatasetMetadata.create({
        title: metadata.title,
        titleArabic: metadata.titleArabic,
        description: metadata.description,
        descriptionArabic: metadata.descriptionArabic,
        keywords: metadata.tags || [],
        license: metadata.license || 'CC BY 4.0',
        author: metadata.author || 'User Created',
        datasetId: dataset._id,
        versionId: latestVersion?._id
      });
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