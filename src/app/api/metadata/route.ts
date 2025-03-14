import { NextRequest, NextResponse } from 'next/server';
import { generateMetadata, MetadataGenerationError } from '@/lib/services/ai/metadataGenerator';
import connectToDatabase from '@/lib/db/mongodb';
import { Dataset, DatasetVersion, DatasetMetadata } from '@/lib/db/models';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    const body = await request.json();
    const { datasetId, language = 'en' } = body;
    
    if (!datasetId) {
      return NextResponse.json(
        { message: 'Dataset ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch the dataset
    const dataset = await Dataset.findById(datasetId);
    
    if (!dataset) {
      return NextResponse.json(
        { message: 'Dataset not found' },
        { status: 404 }
      );
    }
    
    // Get the latest version
    const latestVersion = await DatasetVersion.findOne({ datasetId: dataset._id })
      .sort({ versionNumber: -1 })
      .limit(1);
    
    // In a real application, you would read the file from storage
    // and extract sample data. For this example, we'll create mock data.
    const sampleData = dataset.columns.map(column => {
      return { [column]: `Sample ${column} data` };
    });
    
    // Generate metadata
    const metadata = await generateMetadata(
      {
        filename: dataset.filename,
        rowCount: dataset.rowCount,
        columns: dataset.columns,
        fileSize: dataset.fileSize
      },
      sampleData,
      language as 'en' | 'ar' | 'both'
    );
    
    // Save metadata to database
    const savedMetadata = await DatasetMetadata.create({
      title: metadata.title,
      titleArabic: metadata.titleArabic,
      description: metadata.description,
      descriptionArabic: metadata.descriptionArabic,
      keywords: metadata.tags, // Note: MongoDB model uses keywords instead of tags
      license: 'CC BY 4.0', // Default license
      author: 'System Generated', // Default author
      datasetId: dataset._id,
      versionId: latestVersion?._id
    });
    
    return NextResponse.json({
      message: 'Metadata generated successfully',
      metadata: savedMetadata
    });
  } catch (error) {
    console.error('Error generating metadata:', error);
    
    if (error instanceof MetadataGenerationError) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'An error occurred while generating metadata' },
      { status: 500 }
    );
  }
} 