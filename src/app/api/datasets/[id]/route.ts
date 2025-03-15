import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { Dataset, DatasetVersion, DatasetMetadata } from '@/lib/db/models';
import mongoose from 'mongoose';

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
    
    const id = context.params.id;
    
    // Validate id format to prevent CastError
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid dataset ID format' },
        { status: 400 }
      );
    }
    
    // Get dataset
    const dataset = await Dataset.findById(id);
    
    if (!dataset) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      );
    }
    
    // Get versions
    const versions = await DatasetVersion.find({ datasetId: dataset._id })
      .sort({ versionNumber: -1 })
      .lean();
    
    // Get metadata if available
    let metadata = null;
    if (versions.length > 0) {
      metadata = await DatasetMetadata.findOne({ versionId: versions[0]._id }).lean();
    }
    
    // Return dataset with versions and metadata
    return NextResponse.json({
      ...dataset.toObject(),
      versions,
      metadata
    });
  } catch (error) {
    console.error('Error fetching dataset:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dataset' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    const datasetId = params.id;
    
    // Import models
    const { DatasetVersion, DatasetMetadata } = await import('@/lib/db/models');
    
    // Check if the dataset exists
    const dataset = await Dataset.findById(datasetId);
    
    if (!dataset) {
      return NextResponse.json(
        { message: 'Dataset not found' },
        { status: 404 }
      );
    }
    
    // Check if all versions are in draft status
    const versions = await DatasetVersion.find({ datasetId });
    
    // If any version is not in draft status, don't allow deletion
    const nonDraftVersions = versions.filter(version => version.status !== 'draft');
    if (nonDraftVersions.length > 0) {
      return NextResponse.json(
        { message: 'Cannot delete dataset with non-draft versions' },
        { status: 403 }
      );
    }
    
    // Delete all related data
    // 1. Delete metadata
    await DatasetMetadata.deleteMany({ datasetId });
    
    // 2. Delete versions
    await DatasetVersion.deleteMany({ datasetId });
    
    // 3. Delete the dataset
    await Dataset.findByIdAndDelete(datasetId);
    
    // TODO: Also delete the physical files from storage
    // This would require importing the file storage service
    // and deleting the files associated with each version
    
    return NextResponse.json({ 
      message: 'Dataset and all related data deleted successfully',
      deletedId: datasetId
    });
  } catch (error) {
    console.error('Error deleting dataset:', error);
    return NextResponse.json(
      { message: 'An error occurred while deleting the dataset' },
      { status: 500 }
    );
  }
} 