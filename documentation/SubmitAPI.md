# Dataset Submission API Documentation

This document provides detailed information about the API endpoint for submitting datasets for review in the Dataset Publishing Platform.

## Overview

The Dataset Submission API allows users to submit a dataset for review by a supervisor. This is a critical step in the dataset publishing workflow, transitioning a dataset from "draft" status to "pending_review" status.

## API Endpoint

### Submit Dataset for Review

- **URL**: `/api/datasets/[id]/submit`
- **Method**: `POST`
- **URL Parameters**:
  - `id`: Dataset ID (UUID)
- **Content-Type**: `application/json`

#### Request Body

```json
{
  "versionId": "uuid-string",
  "comments": "Optional comments for the reviewer explaining the dataset or any specific considerations."
}
```

**Required Fields**:
- `versionId`: The ID of the dataset version to submit for review

**Optional Fields**:
- `comments`: Additional information for the reviewer

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "message": "Dataset submitted for review successfully",
    "version": {
      "id": "uuid-string",
      "versionNumber": 1,
      "status": "pending_review",
      "updatedAt": "2023-01-01T12:00:00Z"
    }
  }
}
```

#### Error Responses

**400 Bad Request**:
```json
{
  "success": false,
  "error": {
    "message": "Missing required field: versionId",
    "code": "MISSING_REQUIRED_FIELD"
  }
}
```

**400 Bad Request** (Dataset not ready for submission):
```json
{
  "success": false,
  "error": {
    "message": "Dataset cannot be submitted for review: metadata is missing",
    "code": "INVALID_SUBMISSION"
  }
}
```

**400 Bad Request** (Invalid status transition):
```json
{
  "success": false,
  "error": {
    "message": "Dataset version is already in 'pending_review' status",
    "code": "INVALID_STATUS_TRANSITION"
  }
}
```

**404 Not Found**:
```json
{
  "success": false,
  "error": {
    "message": "Dataset not found",
    "code": "DATASET_NOT_FOUND"
  }
}
```

**404 Not Found**:
```json
{
  "success": false,
  "error": {
    "message": "Dataset version not found",
    "code": "VERSION_NOT_FOUND"
  }
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "error": {
    "message": "An unexpected error occurred",
    "code": "SERVER_ERROR"
  }
}
```

## Implementation Details

### Server-Side Implementation

The submission API endpoint is implemented in Next.js as an API route:

```typescript
// src/app/api/datasets/[id]/submit/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const datasetId = params.id;
    const { versionId, comments } = await request.json();

    // Validate required fields
    if (!versionId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Missing required field: versionId',
            code: 'MISSING_REQUIRED_FIELD',
          },
        },
        { status: 400 }
      );
    }

    // Check if dataset exists
    const dataset = await prisma.dataset.findUnique({
      where: { id: datasetId },
    });

    if (!dataset) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Dataset not found',
            code: 'DATASET_NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    // Check if version exists
    const version = await prisma.datasetVersion.findUnique({
      where: { id: versionId },
      include: { metadata: true },
    });

    if (!version) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Dataset version not found',
            code: 'VERSION_NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    // Check if version belongs to the dataset
    if (version.datasetId !== datasetId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Version does not belong to this dataset',
            code: 'VERSION_MISMATCH',
          },
        },
        { status: 400 }
      );
    }

    // Check if metadata exists
    if (!version.metadata) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Dataset cannot be submitted for review: metadata is missing',
            code: 'INVALID_SUBMISSION',
          },
        },
        { status: 400 }
      );
    }

    // Check if version is in draft status
    if (version.status !== 'draft') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Dataset version is already in '${version.status}' status`,
            code: 'INVALID_STATUS_TRANSITION',
          },
        },
        { status: 400 }
      );
    }

    // Update version status to pending_review
    const updatedVersion = await prisma.datasetVersion.update({
      where: { id: versionId },
      data: {
        status: 'pending_review',
        // Store comments in a separate table in a real implementation
      },
    });

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        message: 'Dataset submitted for review successfully',
        version: updatedVersion,
      },
    });
  } catch (error) {
    console.error('Error submitting dataset for review:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'An unexpected error occurred',
          code: 'SERVER_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
```

### Client-Side Implementation

The client-side component for submitting a dataset:

```tsx
// src/app/datasets/[id]/submit/SubmitForm.tsx

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
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await axios.post(`/api/datasets/${datasetId}/submit`, {
        versionId,
        comments,
      });

      if (response.data.success) {
        setSuccess(true);
        // Redirect after a short delay to show success message
        setTimeout(() => {
          router.push(`/datasets/${datasetId}`);
          router.refresh();
        }, 1500);
      }
    } catch (error: any) {
      setError(
        error.response?.data?.error?.message ||
        'Failed to submit dataset for review. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="comments"
          className="block text-sm font-medium text-gray-700"
        >
          Comments for Reviewer (Optional)
        </label>
        <textarea
          id="comments"
          name="comments"
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Add any comments or context for the reviewer..."
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          disabled={isSubmitting || success}
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <div className="mt-2 text-sm text-green-700">
                Dataset submitted for review successfully. Redirecting...
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={() => router.back()}
          disabled={isSubmitting || success}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          disabled={isSubmitting || success}
        >
          {isSubmitting ? 'Submitting...' : 'Submit for Review'}
        </button>
      </div>
    </form>
  );
}
```

## Validation Rules

The submission API enforces several validation rules:

1. **Required Fields**: The `versionId` field is required
2. **Dataset Existence**: The dataset must exist in the database
3. **Version Existence**: The version must exist in the database
4. **Version Ownership**: The version must belong to the specified dataset
5. **Metadata Requirement**: The dataset must have metadata before submission
6. **Status Validation**: The version must be in "draft" status to be submitted

## Status Transition

The submission API handles the following status transition:

- **From**: `draft`
- **To**: `pending_review`

## Security Considerations

In a production environment, the submission API should implement:

1. **Authentication**: Ensure the user is authenticated
2. **Authorization**: Verify the user has permission to submit the dataset
3. **Rate Limiting**: Prevent abuse through excessive submissions
4. **Input Sanitization**: Sanitize all user inputs to prevent injection attacks

## Testing

### Manual Testing

1. Create a dataset with metadata
2. Submit the dataset for review using the API
3. Verify the status changes to "pending_review"
4. Attempt to submit again and verify the error response

### Automated Testing

```typescript
// Example Jest test for the submission API
describe('Dataset Submission API', () => {
  it('should submit a dataset for review', async () => {
    // Setup test data
    const dataset = await prisma.dataset.create({...});
    const version = await prisma.datasetVersion.create({...});
    const metadata = await prisma.datasetMetadata.create({...});

    // Make API request
    const response = await fetch(`/api/datasets/${dataset.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ versionId: version.id }),
    });

    // Assert response
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.version.status).toBe('pending_review');
  });

  // Additional test cases for error scenarios
});
```

## Related Endpoints

- **GET `/api/datasets/[id]`**: Get dataset details
- **GET `/api/datasets/[id]/metadata`**: Get dataset metadata
- **PUT `/api/datasets/[id]/metadata`**: Update dataset metadata

## Future Enhancements

1. **Comments Storage**: Store reviewer comments in a dedicated database table
2. **Notification System**: Implement notifications for reviewers when datasets are submitted
3. **Submission History**: Track submission history with timestamps and user information
4. **Conditional Submission**: Implement rules for automatic approval of certain datasets
5. **Batch Submission**: Allow submission of multiple datasets in a single request 