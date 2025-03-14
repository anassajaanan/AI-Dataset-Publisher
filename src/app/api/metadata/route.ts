import { NextRequest, NextResponse } from 'next/server';
import { generateMetadata, MetadataGenerationError } from '@/lib/services/ai/metadataGenerator';
import { getFileContent, FileStorageError } from '@/lib/services/storage/fileStorageService';
import connectToDatabase from '@/lib/db/mongodb';
import { Dataset, DatasetVersion, DatasetMetadata } from '@/lib/db/models';
import mongoose from 'mongoose';
import * as Papa from 'papaparse';

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
    
    if (!latestVersion || !latestVersion.filePath) {
      return NextResponse.json(
        { message: 'Dataset file not found' },
        { status: 404 }
      );
    }
    
    // Get file content and sample data
    let fileContent: string | undefined;
    let sampleData: any[] = [];
    
    try {
      // Read the file content
      fileContent = await getFileContent(latestVersion.filePath);
      
      // Parse the file to get sample data
      const fileExtension = dataset.filename.split('.').pop()?.toLowerCase() || '';
      
      if (fileExtension === 'csv') {
        // Parse CSV to get sample data
        const parseResult = Papa.parse(fileContent, { 
          header: true, 
          skipEmptyLines: true,
          preview: 10 // Limit to 10 rows for sample data
        });
        
        sampleData = parseResult.data as any[];
      } else {
        // For non-CSV files, create sample data from columns
        sampleData = dataset.columns.map(column => {
          return { [column]: `Sample ${column} data` };
        });
      }
    } catch (error) {
      console.error('Error reading file:', error);
      
      // If we can't read the file, create mock sample data
      sampleData = dataset.columns.map(column => {
        return { [column]: `Sample ${column} data` };
      });
      
      // Continue without file content
      fileContent = undefined;
    }
    
    // Generate metadata
    const metadata = await generateMetadata(
      {
        filename: dataset.filename,
        rowCount: dataset.rowCount,
        columns: dataset.columns,
        fileSize: dataset.fileSize
      },
      sampleData,
      language as 'en' | 'ar' | 'both',
      fileContent // Pass the file content to the metadata generator
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