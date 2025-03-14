import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { generateEnhancedMetadata } from '@/lib/services/ai/enhancedMetadataGenerator';
import { getFileContent } from '@/lib/services/storage/fileStorageService';
import Papa from 'papaparse';

export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    
    // Parse request body
    const body = await request.json();
    const { datasetId, language = 'en' } = body;
    
    // Validate datasetId
    if (!datasetId) {
      return NextResponse.json(
        { error: 'Dataset ID is required' },
        { status: 400 }
      );
    }
    
    // Get dataset from database
    const dataset = await db.collection('datasets').findOne(
      { _id: datasetId },
      { projection: { versions: 1, name: 1 } }
    );
    
    if (!dataset) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      );
    }
    
    // Get the latest version
    const latestVersion = dataset.versions?.[dataset.versions.length - 1];
    
    if (!latestVersion?.filePath) {
      return NextResponse.json(
        { error: 'Dataset file path not found' },
        { status: 404 }
      );
    }
    
    // Read file content
    const fileContent = await getFileContent(latestVersion.filePath);
    
    // Parse CSV data to get sample rows
    let sampleData: string[][] = [];
    
    if (latestVersion.fileType === 'csv') {
      const parsedData = Papa.parse(fileContent, {
        preview: 10, // Get first 10 rows for sample
        skipEmptyLines: true
      });
      
      if (parsedData.data && Array.isArray(parsedData.data)) {
        sampleData = parsedData.data as string[][];
      }
    }
    
    // Generate enhanced metadata
    const metadata = await generateEnhancedMetadata({
      fileStats: {
        name: dataset.name || latestVersion.fileName,
        size: latestVersion.fileSize,
        rowCount: latestVersion.rowCount,
        columns: latestVersion.columns
      },
      sampleData,
      fileContent,
      language: language as 'en' | 'ar'
    });
    
    return NextResponse.json({ metadata }, { status: 200 });
  } catch (error) {
    console.error('Error generating enhanced metadata:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate metadata' },
      { status: 500 }
    );
  }
} 