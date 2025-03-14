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