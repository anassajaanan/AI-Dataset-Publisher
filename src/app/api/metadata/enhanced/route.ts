import { NextRequest, NextResponse } from 'next/server';
import { generateEnhancedMetadata, EnhancedMetadataGenerationError } from '@/lib/services/ai/enhancedMetadataGenerator';
import { getFileContent, FileStorageError } from '@/lib/services/storage/fileStorageService';
import connectToDatabase from '@/lib/db/mongodb';
import { Dataset, DatasetVersion } from '@/lib/db/models';
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
    let fileContent: string;
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
      
      // Use an empty string for file content
      fileContent = '';
    }
    
    // Generate enhanced metadata with multiple options
    const metadataResponse = await generateEnhancedMetadata(
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
      message: 'Enhanced metadata generated successfully',
      metadata: metadataResponse
    });
  } catch (error) {
    console.error('Error generating enhanced metadata:', error);
    
    if (error instanceof EnhancedMetadataGenerationError) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'An error occurred while generating enhanced metadata' },
      { status: 500 }
    );
  }
} 