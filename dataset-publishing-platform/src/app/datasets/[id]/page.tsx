import React from 'react';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';

const prisma = new PrismaClient();

export const metadata = {
  title: 'Dataset Details - Dataset Publishing Platform',
  description: 'View dataset details and metadata',
};

interface DatasetPageProps {
  params: {
    id: string;
  };
}

async function getDataset(id: string) {
  try {
    const dataset = await prisma.dataset.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
        metadata: {
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
      },
    });
    
    return dataset;
  } catch (error) {
    console.error('Error fetching dataset:', error);
    return null;
  }
}

export default async function DatasetPage({ params }: DatasetPageProps) {
  const dataset = await getDataset(params.id);
  
  if (!dataset) {
    notFound();
  }
  
  const latestVersion = dataset.versions[0];
  const metadata = dataset.metadata[0];
  
  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'published':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-6">
        <Link href="/dashboard" className="text-primary hover:underline flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Dashboard
        </Link>
      </div>
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">{dataset.filename}</h1>
          <div className="mt-2 flex items-center">
            <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(latestVersion.status)}`}>
              {getStatusLabel(latestVersion.status)}
            </span>
            <span className="ml-2 text-sm text-gray-500">
              Version {latestVersion.versionNumber} • Uploaded on {formatDate(dataset.createdAt)}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link
            href={`/datasets/${dataset.id}/metadata`}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Edit Metadata
          </Link>
          {latestVersion.status === 'draft' && (
            <Link
              href={`/datasets/${dataset.id}/submit`}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Submit for Review
            </Link>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">File Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Filename</p>
              <p className="font-medium">{dataset.filename}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Size</p>
              <p className="font-medium">{formatFileSize(dataset.fileSize)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Rows</p>
              <p className="font-medium">{dataset.rowCount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Columns</p>
              <p className="font-medium">{dataset.columns.length}</p>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Columns</h2>
          <div className="flex flex-wrap gap-2">
            {dataset.columns.map((column, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm"
              >
                {column}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {metadata ? (
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <h2 className="text-lg font-semibold mb-4">Metadata</h2>
          
          <div className="mb-6">
            <div className="flex border-b mb-4">
              <button
                className="px-4 py-2 font-medium border-b-2 border-primary text-primary"
              >
                English
              </button>
              {metadata.titleArabic && (
                <button
                  className="px-4 py-2 font-medium text-gray-500"
                >
                  Arabic
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Title</h3>
                <p className="text-lg">{metadata.title}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Description</h3>
                <p className="text-gray-800">{metadata.description}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Category</h3>
                <p>{metadata.category}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {metadata.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8 text-center">
          <p className="text-gray-500 mb-4">No metadata has been added for this dataset yet.</p>
          <Link
            href={`/datasets/${dataset.id}/metadata`}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Add Metadata
          </Link>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Version History</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Version</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Created</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr className="text-sm text-gray-700">
                <td className="px-4 py-3">{latestVersion.versionNumber}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(latestVersion.status)}`}>
                    {getStatusLabel(latestVersion.status)}
                  </span>
                </td>
                <td className="px-4 py-3">{formatDate(latestVersion.createdAt)}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/datasets/${dataset.id}/versions/${latestVersion.id}`}
                    className="text-primary hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 