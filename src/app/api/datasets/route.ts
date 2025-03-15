import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import { Dataset } from '@/lib/db/models';

export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    // Build the query
    const query: any = {};
    
    if (search) {
      query.filename = { $regex: search, $options: 'i' };
    }
    
    // Fetch datasets
    let datasets = await Dataset.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    // If status filter is applied, we need to fetch versions and filter
    if (status && status !== 'all') {
      // We'll filter in memory since we need to join with versions
      const { DatasetVersion } = await import('@/lib/db/models');
      
      // Get all dataset IDs
      const datasetIds = datasets.map(dataset => dataset._id);
      
      // Fetch latest versions for each dataset
      const versions = await DatasetVersion.find({
        datasetId: { $in: datasetIds },
      }).sort({ versionNumber: -1 });
      
      // Create a map of datasetId to its latest version
      const latestVersionMap = new Map();
      versions.forEach(version => {
        const datasetId = version.datasetId.toString();
        if (!latestVersionMap.has(datasetId)) {
          latestVersionMap.set(datasetId, version);
        }
      });
      
      // Filter datasets by status and add versions
      datasets = datasets
        .filter(dataset => {
          const latestVersion = latestVersionMap.get(dataset._id.toString());
          return latestVersion && latestVersion.status === status;
        })
        .map(dataset => {
          const latestVersion = latestVersionMap.get(dataset._id.toString());
          return {
            ...dataset,
            versions: latestVersion ? [latestVersion] : []
          };
        });
    } else {
      // If no status filter, just fetch the latest version for each dataset
      const { DatasetVersion } = await import('@/lib/db/models');
      
      // Get all dataset IDs
      const datasetIds = datasets.map(dataset => dataset._id);
      
      // Fetch latest versions for each dataset
      const versions = await DatasetVersion.find({
        datasetId: { $in: datasetIds },
      }).sort({ versionNumber: -1 });
      
      // Create a map of datasetId to its latest version
      const latestVersionMap = new Map();
      versions.forEach(version => {
        const datasetId = version.datasetId.toString();
        if (!latestVersionMap.has(datasetId)) {
          latestVersionMap.set(datasetId, version);
        }
      });
      
      // Add versions to datasets
      datasets = datasets.map(dataset => {
        const latestVersion = latestVersionMap.get(dataset._id.toString());
        return {
          ...dataset,
          versions: latestVersion ? [latestVersion] : []
        };
      });
    }
    
    return NextResponse.json({ datasets });
  } catch (error) {
    console.error('Error fetching datasets:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching datasets' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Get datasetId from the request
    const { searchParams } = new URL(request.url);
    const datasetId = searchParams.get('id');
    
    if (!datasetId) {
      return NextResponse.json(
        { message: 'Dataset ID is required' },
        { status: 400 }
      );
    }
    
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