# Publishing Workflow and Review System

## Overview

The Publishing Workflow and Review System is a comprehensive feature that manages the lifecycle of datasets from upload to publication. It includes a multi-step workflow, dataset versioning, supervisor review, and status tracking.

## Key Components

### 1. Multi-step Publishing Workflow

The publishing workflow consists of several steps:

1. **Upload**: Users upload CSV or Excel files
2. **Preview**: Users preview the dataset and confirm its contents
3. **Metadata**: Users add or generate metadata for the dataset
4. **Submit**: Users submit the dataset for review
5. **Review**: Supervisors review and approve or reject the dataset
6. **Publish**: Approved datasets are published and made available

Each step has clear requirements and validation to ensure data quality and completeness.

### 2. Dataset Versioning

The system maintains a complete version history for each dataset:

- Each dataset can have multiple versions
- Versions are numbered sequentially
- Each version has a status (draft, review, published, rejected)
- Version history is displayed on the dataset detail page
- Comments can be added to each version

### 3. Supervisor Review Interface

The supervisor review interface allows authorized users to:

- View all datasets pending review
- Filter and search datasets by various criteria
- Review dataset details including metadata and file information
- Approve datasets for publication
- Reject datasets with comments explaining the reason
- Track the status of all datasets in the system

For detailed information about the Supervisor Review Interface, see [Supervisor Review Interface](./supervisor-review.md).

### 4. Status Tracking

Datasets can have the following statuses:

- **Draft**: Initial state, can be edited by the owner
- **Review**: Submitted for supervisor review, cannot be edited
- **Published**: Approved by a supervisor, available for use
- **Rejected**: Rejected by a supervisor, can be revised and resubmitted

Status changes are tracked in the version history with timestamps and user information.

## Implementation Details

### API Endpoints

#### `/api/datasets/[id]/submit`

**Method**: POST

**Purpose**: Submit a dataset for review

**Request Body**:
```json
{
  "versionId": "string",
  "comments": "string (optional)"
}
```

**Response**:
```json
{
  "message": "Dataset submitted for review successfully",
  "version": {
    "id": "string",
    "status": "review",
    "comments": "string (optional)"
  }
}
```

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

### Database Schema

The system uses the following MongoDB schemas:

#### Dataset

```typescript
interface IDataset {
  filename: string;
  fileSize: number;
  rowCount: number;
  columns: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### DatasetVersion

```typescript
interface IDatasetVersion {
  datasetId: mongoose.Types.ObjectId;
  versionNumber: number;
  filePath: string;
  status: 'draft' | 'review' | 'published' | 'rejected';
  comments?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### UI Components

#### SubmitForm

Client-side component for submitting datasets for review:

```tsx
interface SubmitFormProps {
  datasetId: string;
  versionId: string;
}

export default function SubmitForm({ datasetId, versionId }: SubmitFormProps) {
  // Implementation details...
}
```

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

### Dataset Owner Flow

1. User uploads a dataset file
2. User previews the dataset and confirms its contents
3. User adds or generates metadata for the dataset
4. User submits the dataset for review with optional comments
5. User waits for supervisor review
6. If rejected, user can view rejection comments and resubmit
7. If approved, the dataset is published

### Supervisor Flow

1. Supervisor logs in and navigates to the supervisor dashboard
2. Supervisor views datasets pending review
3. Supervisor selects a dataset to review
4. Supervisor reviews dataset details, file information, and metadata
5. Supervisor approves the dataset or rejects it with comments
6. Supervisor can view all datasets and their statuses

## Security and Access Control

- Only authorized supervisors can access the review interface
- Dataset owners can only submit their own datasets for review
- Only datasets with complete metadata can be submitted for review
- Rejected datasets can only be resubmitted after modifications

## Future Enhancements

- Email notifications for status changes
- More detailed review criteria and checklists
- Multi-level approval workflow for complex datasets
- Automated validation checks before submission
- Analytics dashboard for tracking review metrics 