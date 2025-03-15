'use client';

import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
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

type DatasetActionsProps = {
  datasetId: string;
  filename: string;
  status?: string;
  onDelete?: () => void;
  variant?: 'card' | 'list';
};

export const DatasetActions: React.FC<DatasetActionsProps> = ({ 
  datasetId, 
  filename, 
  status = 'draft',
  onDelete,
  variant = 'list'
}) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDraft = status === 'draft';

  const deleteDataset = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      
      // Ensure we have a valid ID
      if (!datasetId) {
        setError('Invalid dataset ID');
        return;
      }
      
      // Log the dataset ID being deleted
      console.log('Deleting dataset with ID:', datasetId);
      
      // Make the delete request
      const response = await axios.delete(`/api/datasets/${datasetId}`);
      console.log('Delete response:', response.data);
      
      // Call the onDelete callback if provided
      if (onDelete) {
        onDelete();
      } else {
        // Refresh the page if no callback provided
        router.refresh();
      }
    } catch (error: any) {
      console.error('Error deleting dataset:', error);
      setError(error.response?.data?.message || 'Failed to delete dataset');
    } finally {
      setIsDeleting(false);
    }
  };

  if (variant === 'card') {
    return (
      <div className="flex gap-2 mt-2">
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/datasets/${datasetId}`}>View</Link>
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the dataset
                "{filename}" and all its associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={deleteDataset}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {error && (
          <div className="text-red-600 text-sm mt-2">{error}</div>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Link
        href={`/datasets/${datasetId}`}
        className="text-primary hover:underline"
      >
        View
      </Link>
      {isDraft && (
        <Link
          href={`/datasets/${datasetId}/edit`}
          className="text-primary hover:underline"
        >
          Edit
        </Link>
      )}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button className="text-red-600 hover:underline">
            Delete
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the dataset
              "{filename}" and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteDataset}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
    </div>
  );
}; 