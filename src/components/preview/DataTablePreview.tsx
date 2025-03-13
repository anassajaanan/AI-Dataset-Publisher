'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface DataTablePreviewProps {
  datasetId: string;
  maxRows?: number;
}

type PreviewData = {
  headers: string[];
  rows: any[][];
  totalRows: number;
};

const DataTablePreview: React.FC<DataTablePreviewProps> = ({ datasetId, maxRows = 10 }) => {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreviewData = async () => {
      if (!datasetId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`/api/datasets/${datasetId}/preview?rows=${maxRows}`);
        
        if (response.data.success) {
          setPreviewData(response.data.data);
        } else {
          setError(response.data.message || 'Failed to load preview data');
        }
      } catch (err) {
        console.error('Error fetching preview data:', err);
        setError('Failed to load preview data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPreviewData();
  }, [datasetId, maxRows]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading preview data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!previewData || !previewData.headers.length) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">No preview data available for this dataset.</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto mt-4">
      <div className="text-sm text-gray-500 mb-2">
        Showing {previewData.rows.length} of {previewData.totalRows} rows
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {previewData.headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {previewData.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cell !== null && cell !== undefined ? String(cell) : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTablePreview; 