import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { generateMetadata, MetadataGenerationError } from '@/lib/services/ai/metadataGenerator';
import { getFileContent } from '@/lib/services/storage/fileStorageService';
import Papa from 'papaparse';
import mongoose from 'mongoose';
import { Dataset, DatasetVersion } from '@/lib/db/models';

export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Parse request body
    const body = await request.json();
    const { datasetId, language = 'en' } = body;
    
    // Validate datasetId
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
    
    if (!latestVersion?.filePath) {
      return NextResponse.json(
        { message: 'Dataset file not found' },
        { status: 404 }
      );
    }
    
    // Get file content and sample data
    let fileContent: string;
    let sampleData: any[] = [];
    
    try {
      // Read the file content
      fileContent = await getFileContent(latestVersion.filePath);
      
      // Determine file type from filename
      const fileExtension = dataset.filename.split('.').pop()?.toLowerCase() || '';
      const isCSV = fileExtension === 'csv';
      
      // Parse the file to get sample data
      if (isCSV) {
        // Parse CSV to get sample data
        const parseResult = Papa.parse(fileContent, { 
          header: true, 
          skipEmptyLines: true,
          preview: 10 // Limit to 10 rows for sample data
        });
        
        sampleData = parseResult.data as any[];
      } else {
        // For non-CSV files, create sample data from columns
        sampleData = dataset.columns.map((column: string) => {
          return { [column]: `Sample ${column} data` };
        });
      }
    } catch (error) {
      console.error('Error reading file:', error);
      
      // If we can't read the file, create mock sample data
      sampleData = dataset.columns.map((column: string) => {
        return { [column]: `Sample ${column} data` };
      });
      
      // Use an empty string for file content
      fileContent = '';
    }
    
    // Generate metadata
    const metadataResponse = await generateMetadata(
      {
        filename: dataset.filename,
        rowCount: dataset.rowCount,
        columns: dataset.columns,
        fileSize: dataset.fileSize
      },
      sampleData,
      fileContent,
      language as 'en' | 'ar' | 'both'
    );
    
    return NextResponse.json({
      message: 'Metadata generated successfully',
      metadata: metadataResponse.options
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