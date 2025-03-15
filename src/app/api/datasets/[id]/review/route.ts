import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { Dataset, DatasetVersion } from '@/lib/db/models';

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
}

interface VersionDocument extends MongoDocument {
  datasetId: any;
  status: string;
  comments?: string;
  save(): Promise<VersionDocument>;
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Get dataset ID from params
    const { id } = context.params;
    
    // Parse request body
    const body = await request.json();
    const { versionId, action, comments } = body;
    
    // Validate required fields
    if (!versionId) {
      return NextResponse.json(
        { message: 'Version ID is required' },
        { status: 400 }
      );
    }
    
    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { message: 'Valid action (approve or reject) is required' },
        { status: 400 }
      );
    }
    
    // If rejecting, comments are required
    if (action === 'reject' && !comments) {
      return NextResponse.json(
        { message: 'Comments are required when rejecting a dataset' },
        { status: 400 }
      );
    }
    
    // Find the dataset
    const dataset = await Dataset.findById(id) as DatasetDocument;
    
    if (!dataset) {
      return NextResponse.json(
        { message: 'Dataset not found' },
        { status: 404 }
      );
    }
    
    // Find the version
    const version = await DatasetVersion.findById(versionId) as VersionDocument;
    
    if (!version) {
      return NextResponse.json(
        { message: 'Version not found' },
        { status: 404 }
      );
    }
    
    // Check if the version belongs to the dataset
    if (version.datasetId.toString() !== dataset._id.toString()) {
      return NextResponse.json(
        { message: 'Version does not belong to this dataset' },
        { status: 400 }
      );
    }
    
    // Check if the version is in review status
    if (version.status !== 'review') {
      return NextResponse.json(
        { message: 'Only versions in review status can be approved or rejected' },
        { status: 400 }
      );
    }
    
    // Update the version status based on the action
    if (action === 'approve') {
      version.status = 'published';
    } else {
      version.status = 'rejected';
    }
    
    // Add comments if provided
    if (comments) {
      version.comments = comments;
    }
    
    // Save the updated version
    await version.save();
    
    // Return success response
    return NextResponse.json({
      message: `Dataset ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      version: {
        id: version._id,
        status: version.status,
        comments: version.comments
      }
    });
  } catch (error) {
    console.error('Error reviewing dataset:', error);
    return NextResponse.json(
      { message: 'An error occurred while reviewing the dataset' },
      { status: 500 }
    );
  }
} 