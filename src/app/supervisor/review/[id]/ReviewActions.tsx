'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
} from '@/components/ui/alert-dialog';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ReviewActionsProps {
  datasetId: string;
  versionId: string;
}

export default function ReviewActions({ datasetId, versionId }: ReviewActionsProps) {
  const router = useRouter();
  const [comments, setComments] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState<boolean>(false);
  
  const handleApprove = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await axios.post(`/api/datasets/${datasetId}/review`, {
        versionId,
        action: 'approve',
        comments
      });
      
      // Redirect to the supervisor dashboard
      router.push('/supervisor/dashboard?action=approved');
      router.refresh();
    } catch (error) {
      console.error('Error approving dataset:', error);
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || 'Failed to approve dataset.');
      } else {
        setError('Failed to approve dataset. Please try again.');
      }
      setIsSubmitting(false);
    }
  };
  
  const handleReject = async () => {
    if (!comments.trim()) {
      setError('Please provide a reason for rejection.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await axios.post(`/api/datasets/${datasetId}/review`, {
        versionId,
        action: 'reject',
        comments
      });
      
      // Redirect to the supervisor dashboard
      router.push('/supervisor/dashboard?action=rejected');
      router.refresh();
    } catch (error) {
      console.error('Error rejecting dataset:', error);
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || 'Failed to reject dataset.');
      } else {
        setError('Failed to reject dataset. Please try again.');
      }
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md" role="alert">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      <div>
        <label htmlFor="comments" className="block text-sm font-medium mb-2">
          Comments (required for rejection)
        </label>
        <Textarea
          id="comments"
          placeholder="Enter your comments or feedback about this dataset..."
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={4}
          className="w-full"
        />
      </div>
      
      <div className="flex justify-end gap-4">
        <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              Reject Dataset
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reject Dataset</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to reject this dataset? This action will notify the submitter.
                {!comments.trim() && (
                  <div className="mt-2 text-red-500">
                    Please provide a reason for rejection in the comments field.
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReject}
                disabled={!comments.trim() || isSubmitting}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {isSubmitting ? 'Rejecting...' : 'Reject Dataset'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="default" 
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve Dataset
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Approve Dataset</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to approve this dataset? This will make it available for public use.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleApprove}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 focus:ring-green-600"
              >
                {isSubmitting ? 'Approving...' : 'Approve Dataset'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
} 