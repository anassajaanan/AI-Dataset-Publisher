import { NextRequest, NextResponse } from 'next/server';
import { processFile, FileProcessingError } from '@/lib/services/fileProcessingService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    // Process the file to get statistics
    const fileStats = await processFile(file);

    // Save file data to database
    const dataset = await prisma.dataset.create({
      data: {
        filename: fileStats.filename,
        fileSize: fileStats.fileSize,
        rowCount: fileStats.rowCount,
        columns: fileStats.columns,
      },
    });

    // Create initial version
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    // In a real application, you would save the file to a storage service
    // For this example, we'll just pretend we saved it and store the path
    const filePath = `/uploads/${dataset.id}/${fileStats.filename}`;
    
    await prisma.datasetVersion.create({
      data: {
        versionNumber: 1,
        filePath,
        status: 'draft',
        datasetId: dataset.id,
      },
    });

    return NextResponse.json({ 
      message: 'File uploaded successfully',
      fileStats,
      datasetId: dataset.id
    });
  } catch (error) {
    console.error('Error processing file:', error);
    
    if (error instanceof FileProcessingError) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'An error occurred while processing the file' },
      { status: 500 }
    );
  }
} 