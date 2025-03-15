import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { Dataset, DatasetVersion } from '@/lib/db/models';
import { processFile } from '@/lib/services/fileProcessingService';
import { saveFile } from '@/lib/services/storage/fileStorageService';

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
    
    // Get dataset ID from params
    const params = await context.params;
    const id = params.id;
    
    // Find the dataset
    const dataset = await Dataset.findById(id);
    
    if (!dataset) {
      return NextResponse.json(
        { message: 'Dataset not found' },
        { status: 404 }
      );
    }
    
    // Find all versions for this dataset
    const versions = await DatasetVersion.find({ datasetId: dataset._id })
      .sort({ versionNumber: -1 });
    
    // Return versions
    return NextResponse.json({
      message: 'Versions retrieved successfully',
      versions: versions.map(version => ({
        id: version._id.toString(),
        versionNumber: version.versionNumber,
        status: version.status,
        comments: version.comments,
        createdAt: version.createdAt,
        updatedAt: version.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error retrieving dataset versions:', error);
    return NextResponse.json(
      { message: 'An error occurred while retrieving dataset versions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Get dataset ID from params
    const params = await context.params;
    const id = params.id;
    
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const comments = formData.get('comments') as string;
    
    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { message: 'No file provided. Please select a file to upload.' },
        { status: 400 }
      );
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: `File is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum size is 10MB.` },
        { status: 400 }
      );
    }
    
    // Validate file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const validExtensions = ['csv', 'xls', 'xlsx'];
    
    if (!validExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { message: `Invalid file type: .${fileExtension}. Please upload a CSV or Excel file (.csv, .xls, .xlsx).` },
        { status: 400 }
      );
    }
    
    // Find the dataset
    const dataset = await Dataset.findById(id);
    
    if (!dataset) {
      return NextResponse.json(
        { message: 'Dataset not found' },
        { status: 404 }
      );
    }
    
    // Process the file to get statistics
    const fileStats = await processFile(file);
    
    // Validate that the file has the same columns as the original dataset
    if (fileStats.columns.length !== dataset.columns.length || 
        !fileStats.columns.every(col => dataset.columns.includes(col))) {
      return NextResponse.json(
        { message: 'The new file must have the same columns as the original dataset.' },
        { status: 400 }
      );
    }
    
    // Find the latest version number
    const latestVersion = await DatasetVersion.findOne({ datasetId: dataset._id })
      .sort({ versionNumber: -1 });
    
    const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;
    
    // Save the file to the file system
    const filePath = await saveFile(file, id, newVersionNumber.toString());
    
    // Create new version
    const versionData = {
      versionNumber: newVersionNumber,
      filePath,
      status: 'draft',
      datasetId: dataset._id,
      comments: comments || `Version ${newVersionNumber}`
    };
    
    const newVersion = await DatasetVersion.create(versionData);
    
    // Update dataset with new file stats if needed
    if (fileStats.rowCount !== dataset.rowCount || fileStats.fileSize !== dataset.fileSize) {
      dataset.rowCount = fileStats.rowCount;
      dataset.fileSize = fileStats.fileSize;
      await dataset.save();
    }
    
    // Return success response
    return NextResponse.json({
      message: 'New version created successfully',
      version: {
        id: newVersion._id.toString(),
        versionNumber: newVersion.versionNumber,
        status: newVersion.status,
        comments: newVersion.comments,
        createdAt: newVersion.createdAt
      },
      datasetId: id
    });
  } catch (error) {
    console.error('Error creating new dataset version:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating a new dataset version' },
      { status: 500 }
    );
  }
} 