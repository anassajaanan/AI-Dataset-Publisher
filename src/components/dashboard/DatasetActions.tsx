'use client';

import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  FileEdit,
  ExternalLink
} from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type DatasetActionsProps = {
  datasetId: string;
  filename: string;
  status?: string;
  onDelete?: () => void;
  variant?: 'card' | 'list' | 'dropdown';
};

export const DatasetActions: React.FC<DatasetActionsProps> = ({ 
  datasetId, 
  filename, 
  status = 'draft',
  onDelete,
  variant = 'dropdown'
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
      
      // Make the delete request
      const response = await axios.delete(`/api/datasets/${datasetId}`);
      
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

  // Card variant with prominent buttons
  if (variant === 'card') {
    return (
      <div className="flex gap-2 mt-2">
        <Button asChild variant="outline" className="flex-1 gap-1">
          <Link href={`/datasets/${datasetId}`}>
            <Eye className="h-4 w-4" />
            View
          </Link>
        </Button>
        
        {isDraft && (
          <Button asChild variant="outline" className="flex-1 gap-1">
            <Link href={`/datasets/${datasetId}/edit`}>
              <Edit className="h-4 w-4" />
              Edit
            </Link>
          </Button>
        )}
        
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

  // List variant with text links
  if (variant === 'list') {
    return (
      <div className="flex gap-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={`/datasets/${datasetId}`}
                className="text-primary hover:text-primary/80 transition-colors"
              >
                <Eye className="h-4 w-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>View dataset</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {isDraft && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={`/datasets/${datasetId}/edit`}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit dataset</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="text-red-500 hover:text-red-700 transition-colors">
                    <Trash2 className="h-4 w-4" />
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
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete dataset</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/datasets/${datasetId}`} className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4" />
              <span>View</span>
            </Link>
          </DropdownMenuItem>
          {isDraft && (
            <DropdownMenuItem asChild>
              <Link href={`/datasets/${datasetId}/edit`} className="cursor-pointer">
                <FileEdit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="text-red-600 focus:text-red-600 cursor-pointer"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
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
        </DropdownMenuContent>
      </DropdownMenu>
      
      {error && (
        <div className="absolute right-0 mt-2 text-red-600 text-sm whitespace-nowrap bg-white p-2 rounded-md shadow-md border border-red-200 z-50">
          {error}
        </div>
      )}
    </div>
  );
}; 