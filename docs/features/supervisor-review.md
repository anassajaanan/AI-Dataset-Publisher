# Supervisor Review Interface

## Overview

The Supervisor Review Interface is a critical component of the Dataset Publishing Platform that enables authorized supervisors to review, approve, or reject datasets submitted by users. This feature ensures data quality and metadata accuracy before datasets are published and made available to the public.

## Key Components

### 1. Review Page

The review page (`/supervisor/review/[id]`) provides a comprehensive view of a dataset, including:

- **File Information**: Displays filename, file size, row count, and column count
- **Columns Display**: Shows all columns in the dataset, organized in a readable format
- **Metadata Display**: Presents the dataset's metadata with bilingual support (English/Arabic)
- **Version History**: Lists all versions of the dataset with their status and timestamps
- **Review Actions**: Provides options to approve or reject the dataset with comments

### 2. Review Actions

The review actions component allows supervisors to:

- **Approve** datasets that meet quality standards
- **Reject** datasets with detailed comments explaining the reason
- **Add Comments** to provide feedback to dataset owners

### 3. Status Management

The system tracks the status of each dataset version:

- **Review**: Datasets submitted for supervisor review
- **Published**: Datasets approved by a supervisor
- **Rejected**: Datasets rejected by a supervisor with comments

## Implementation Details

### API Endpoints

#### `/api/datasets/[id]/review`

**Method**: POST

**Purpose**: Review a dataset (approve or reject)

**Request Body**:
```json
{
  "versionId": "string",
  "action": "approve" | "reject",
  "comments": "string (required for rejection)"
}
```

**Response**:
```json
{
  "message": "Dataset approved/rejected successfully",
  "version": {
    "id": "string",
    "status": "published" | "rejected",
    "comments": "string (optional)"
  }
}
```

### UI Components

#### ReviewActions

Client-side component for reviewing datasets:

```tsx
interface ReviewActionsProps {
  datasetId: string;
  versionId: string;
}

export default function ReviewActions({ datasetId, versionId }: ReviewActionsProps) {
  // Implementation details...
}
```

## User Flow

### Supervisor Review Flow

1. Supervisor logs in and navigates to the supervisor dashboard
2. Supervisor views datasets pending review
3. Supervisor selects a dataset to review
4. Supervisor reviews dataset details, file information, and metadata
5. Supervisor approves the dataset or rejects it with comments
6. System updates the dataset status and notifies the owner

## Features

### Bilingual Support

The review page supports both English and Arabic content:

- Metadata can be displayed in both languages
- UI elements adapt to the selected language
- RTL (Right-to-Left) formatting is properly handled for Arabic content

### Responsive Design

The review page is designed to be responsive and work well on various screen sizes:

- Card-based layout adapts to different screen widths
- Information is organized in a clear and accessible manner
- UI components are optimized for both desktop and mobile viewing

### Status Indicators

The system uses visual indicators to show the status of datasets:

- Color-coded badges for different statuses
- Icons to enhance status visibility
- Clear labeling for each status type

## Security and Access Control

- Only authorized supervisors can access the review interface
- Review actions are logged for accountability
- Approval/rejection requires confirmation to prevent accidental actions

## Future Enhancements

- Email notifications for status changes
- More detailed review criteria and checklists
- Multi-level approval workflow for complex datasets
- Analytics dashboard for tracking review metrics
- Batch approval/rejection for multiple datasets 