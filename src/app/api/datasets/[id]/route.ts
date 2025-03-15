import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { Dataset, DatasetVersion, DatasetMetadata } from '@/lib/db/models';
import mongoose from 'mongoose';

interface RouteContext {
  params: {
    id: string;
  };
}

// Define interfaces for MongoDB document types
interface MongoDocument {
  _id: any;
  toString(): string;
}

interface DatasetDocument extends MongoDocument {
  // Add any other dataset properties needed
  toObject(): Record<string, any>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Get dataset ID from params
    const { id } = context.params;
    
    // Find the dataset
    const dataset = await Dataset.findById(id) as DatasetDocument;
    
    if (!dataset) {
      return NextResponse.json(
        { message: 'Dataset not found' },
        { status: 404 }
      );
    }
    
    // Get all versions for this dataset
    const versions = await DatasetVersion.find({ datasetId: dataset._id })
      .sort({ versionNumber: -1 });
    
    // Get metadata for this dataset
    const metadata = await DatasetMetadata.findOne({ datasetId: dataset._id });
    
    // Return the dataset with versions and metadata
    return NextResponse.json({
      dataset: {
        id: dataset._id.toString(), // Add id property for consistency
        ...dataset.toObject(),
        versions,
        metadata
      }
    });
  } catch (error) {
    console.error('Error fetching dataset:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching the dataset' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Ensure params.id is a string and valid
    const datasetId = context.params.id;
    
    console.log('DELETE request for dataset ID:', datasetId);
    
    if (!datasetId || !mongoose.Types.ObjectId.isValid(datasetId)) {
      console.error('Invalid dataset ID format:', datasetId);
      return NextResponse.json(
        { message: 'Invalid dataset ID format' },
        { status: 400 }
      );
    }
    
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
      { message: 'An error occurred while deleting the dataset', 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
} 