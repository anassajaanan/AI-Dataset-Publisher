import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { Dataset, DatasetVersion, DatasetMetadata } from '@/lib/db/models';

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

interface MetadataDocument extends MongoDocument {
  datasetId: any;
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
    const { versionId, comments } = body;
    
    // Validate required fields
    if (!versionId) {
      return NextResponse.json(
        { message: 'Version ID is required' },
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
    
    // Check if the version is in draft status
    if (version.status !== 'draft') {
      return NextResponse.json(
        { message: 'Only draft versions can be submitted for review' },
        { status: 400 }
      );
    }
    
    // Check if metadata exists for this dataset
    const metadata = await DatasetMetadata.findOne({ datasetId: dataset._id }) as MetadataDocument | null;
    
    if (!metadata) {
      return NextResponse.json(
        { message: 'Metadata is required before submitting for review' },
        { status: 400 }
      );
    }
    
    // Update the version status to review
    version.status = 'review';
    
    // Add comments if provided
    if (comments) {
      version.comments = comments;
    }
    
    // Save the updated version
    await version.save();
    
    // Return success response
    return NextResponse.json({
      message: 'Dataset submitted for review successfully',
      version: {
        id: version._id,
        status: version.status,
        comments: version.comments
      }
    });
  } catch (error) {
    console.error('Error submitting dataset for review:', error);
    return NextResponse.json(
      { message: 'An error occurred while submitting the dataset for review' },
      { status: 500 }
    );
  }
} 