import { NextRequest, NextResponse } from 'next/server';
import { processFile, FileProcessingError } from '@/lib/services/fileProcessingService';
import { saveFile, FileStorageError } from '@/lib/services/storage/fileStorageService';
import connectToDatabase from '@/lib/db/mongodb';
import { Dataset, DatasetVersion } from '@/lib/db/models';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    try {
      await connectToDatabase();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { message: 'Database connection error. Please try again later.' },
        { status: 500 }
      );
    }
    
    // Parse the form data
    let formData;
    try {
      formData = await request.formData();
    } catch (formError) {
      console.error('Form data parsing error:', formError);
      return NextResponse.json(
        { message: 'Error parsing form data. Please try again.' },
        { status: 400 }
      );
    }
    
    const file = formData.get('file') as File;

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
    
    // Validate file is not empty
    if (file.size === 0) {
      return NextResponse.json(
        { message: 'File is empty. Please upload a non-empty file.' },
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
    
    // Process the file to get statistics
    let fileStats;
    try {
      fileStats = await processFile(file);
    } catch (processError) {
      console.error('File processing error:', processError);
      if (processError instanceof FileProcessingError) {
        return NextResponse.json(
          { message: processError.message },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { message: 'Failed to process file. Please try again with a different file.' },
        { status: 400 }
      );
    }

    // Save file data to database
    const datasetData = {
      filename: fileStats.filename,
      fileSize: fileStats.fileSize,
      rowCount: fileStats.rowCount,
      columns: fileStats.columns,
    };
    
    // Create the dataset and get its ID
    let result;
    try {
      result = await Dataset.create(datasetData);
    } catch (dbError) {
      console.error('Database error when creating dataset:', dbError);
      return NextResponse.json(
        { message: 'Error saving dataset to database. Please try again.' },
        { status: 500 }
      );
    }
    
    // Use a type assertion to tell TypeScript that result has an _id property
    const datasetDoc = result as unknown as { _id: mongoose.Types.ObjectId };
    const datasetId = datasetDoc._id.toString();

    // Save the file to the file system
    let filePath;
    try {
      filePath = await saveFile(file, datasetId);
    } catch (storageError) {
      console.error('Error saving file to storage:', storageError);
      
      // Even if file storage fails, we'll still create the dataset version
      // with a placeholder path, but log the error
      filePath = `/uploads/${datasetId}/${fileStats.filename}`;
    }

    // Create initial version
    try {
      const versionData = {
        versionNumber: 1,
        filePath,
        status: 'draft',
        datasetId: datasetId,
      };
      
      await DatasetVersion.create(versionData);
    } catch (error) {
      console.error('Error creating dataset version:', error);
      // Even if version creation fails, we'll still return the dataset and file stats
      // In a production app, you might want to handle this differently
    }

    return NextResponse.json({ 
      message: 'File uploaded successfully',
      fileStats,
      datasetId
    });
  } catch (error) {
    // For any other errors, return a generic error message
    console.error('Unexpected error during file upload:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred while processing the file. Please try again with a different file.' },
      { status: 500 }
    );
  }
} 