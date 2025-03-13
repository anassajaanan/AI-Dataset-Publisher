import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateMetadata, MetadataGenerationError } from '@/lib/services/ai/metadataGenerator';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { datasetId, language = 'en' } = body;
    
    if (!datasetId) {
      return NextResponse.json(
        { message: 'Dataset ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch the dataset
    const dataset = await prisma.dataset.findUnique({
      where: { id: datasetId },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1
        }
      }
    });
    
    if (!dataset) {
      return NextResponse.json(
        { message: 'Dataset not found' },
        { status: 404 }
      );
    }
    
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
    const savedMetadata = await prisma.datasetMetadata.create({
      data: {
        title: metadata.title,
        titleArabic: metadata.titleArabic,
        description: metadata.description,
        descriptionArabic: metadata.descriptionArabic,
        tags: metadata.tags,
        category: metadata.category,
        isAIGenerated: true,
        datasetId: dataset.id,
        versionId: dataset.versions[0]?.id
      }
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