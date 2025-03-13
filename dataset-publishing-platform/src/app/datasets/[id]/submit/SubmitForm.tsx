'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface SubmitFormProps {
  datasetId: string;
  versionId: string;
}

export default function SubmitForm({ datasetId, versionId }: SubmitFormProps) {
  const router = useRouter();
  const [comments, setComments] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // In a real application, this would call an API endpoint to update the status
      await axios.post(`/api/datasets/${datasetId}/submit`, {
        versionId,
        comments
      });
      
      // Redirect to the dataset page
      router.push(`/datasets/${datasetId}?submitted=true`);
    } catch (error) {
      console.error('Error submitting dataset:', error);
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || 'Failed to submit dataset.');
      } else {
        setError('Failed to submit dataset. Please try again.');
      }
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md" role="alert">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      <div className="mb-6">
        <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
          Comments for Reviewer (Optional)
        </label>
        <textarea
          id="comments"
          rows={4}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Add any comments or notes for the reviewer"
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit for Review'}
        </button>
      </div>
    </form>
  );
} 