import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const params = await context.params;
    const datasetId = params.id;
    
    // Find the latest metadata for this dataset
    const metadata = await prisma.datasetMetadata.findFirst({
      where: {
        datasetId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    
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
  context: { params: { id: string } }
) {
  try {
    const params = await context.params;
    const datasetId = params.id;
    const { metadata } = await request.json();
    
    // Validate required fields
    if (!metadata.title || !metadata.description || !metadata.category) {
      return NextResponse.json(
        { message: 'Title, description, and category are required' },
        { status: 400 }
      );
    }
    
    // Find the dataset
    const dataset = await prisma.dataset.findUnique({
      where: { id: datasetId },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
      },
    });
    
    if (!dataset) {
      return NextResponse.json(
        { message: 'Dataset not found' },
        { status: 404 }
      );
    }
    
    // Find existing metadata
    const existingMetadata = await prisma.datasetMetadata.findFirst({
      where: {
        datasetId,
        versionId: dataset.versions[0]?.id,
      },
    });
    
    let updatedMetadata;
    
    if (existingMetadata) {
      // Update existing metadata
      updatedMetadata = await prisma.datasetMetadata.update({
        where: { id: existingMetadata.id },
        data: {
          title: metadata.title,
          titleArabic: metadata.titleArabic,
          description: metadata.description,
          descriptionArabic: metadata.descriptionArabic,
          tags: metadata.tags,
          category: metadata.category,
          isAIGenerated: false,
        },
      });
    } else {
      // Create new metadata
      updatedMetadata = await prisma.datasetMetadata.create({
        data: {
          title: metadata.title,
          titleArabic: metadata.titleArabic,
          description: metadata.description,
          descriptionArabic: metadata.descriptionArabic,
          tags: metadata.tags,
          category: metadata.category,
          isAIGenerated: false,
          datasetId,
          versionId: dataset.versions[0]?.id,
        },
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