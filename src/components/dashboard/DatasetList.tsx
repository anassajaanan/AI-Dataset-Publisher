'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { DatasetActions } from './DatasetActions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type DatasetVersion = {
  _id?: string;
  id?: string;
  versionNumber: number;
  status: string;
  createdAt: string;
};

type Dataset = {
  _id?: string;
  id?: string;
  filename: string;
  rowCount: number;
  columns: string[];
  createdAt: string;
  versions: DatasetVersion[];
};

export const DatasetList: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchDatasets = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      const response = await axios.get(`/api/datasets?${params.toString()}`);
      
      // Log the dataset IDs for debugging
      console.log('Datasets received:', response.data.datasets.map(d => ({ 
        _id: d._id, 
        id: d.id,
        filename: d.filename
      })));
      
      setDatasets(response.data.datasets);
    } catch (error) {
      console.error('Error fetching datasets:', error);
      setError('Failed to load datasets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteDataset = async (datasetId: string) => {
    try {
      setDeletingId(datasetId);
      setDeleteError(null);
      
      // Ensure we have a valid ID
      if (!datasetId) {
        setDeleteError('Invalid dataset ID');
        return;
      }
      
      // Log the dataset ID being deleted
      console.log('Deleting dataset with ID:', datasetId);
      
      // Make the delete request
      const response = await axios.delete(`/api/datasets/${datasetId}`);
      console.log('Delete response:', response.data);
      
      // Refresh the dataset list
      fetchDatasets();
    } catch (error: any) {
      console.error('Error deleting dataset:', error);
      setDeleteError(error.response?.data?.message || 'Failed to delete dataset');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, [statusFilter, searchQuery]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
    if (!status) return 'Unknown';
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Your Datasets</h2>
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search datasets..."
              className="px-4 py-2 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <select 
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending_review">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="published">Published</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      
      {deleteError && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
          {deleteError}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">
          <p>Loading datasets...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">
          <p>{error}</p>
        </div>
      ) : datasets.length === 0 ? (
        <div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Filename</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Rows</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Columns</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Version</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Created</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr className="text-sm text-gray-700">
                  <td className="px-4 py-3">No datasets found</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3"></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-500">
              No datasets found. Start by uploading a dataset.
            </p>
            <Link 
              href="/upload" 
              className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Upload Dataset
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Filename</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Rows</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Columns</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Version</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Created</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {datasets.map((dataset) => {
                const latestVersion = dataset.versions[0];
                const isDraft = latestVersion?.status === 'draft';
                // Use _id if available, otherwise fall back to id
                const datasetId = dataset._id || dataset.id;
                
                return (
                  <tr key={datasetId} className="text-sm text-gray-700 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{dataset.filename}</td>
                    <td className="px-4 py-3">{dataset.rowCount.toLocaleString()}</td>
                    <td className="px-4 py-3">{dataset.columns.length}</td>
                    <td className="px-4 py-3">{latestVersion?.versionNumber || 1}</td>
                    <td className="px-4 py-3">
                      {latestVersion && (
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(latestVersion.status)}`}>
                          {getStatusLabel(latestVersion.status)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{formatDate(dataset.createdAt)}</td>
                    <td className="px-4 py-3">
                      <DatasetActions 
                        datasetId={datasetId} 
                        filename={dataset.filename}
                        status={latestVersion?.status}
                        onDelete={fetchDatasets}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}; 