# Dataset Versioning

## Overview

The Dataset Versioning feature allows users to create and manage multiple versions of a dataset while maintaining a complete version history. This feature is essential for tracking changes to datasets over time, ensuring data quality, and providing a clear audit trail of modifications.

## Key Components

### 1. Version Management

The system provides comprehensive version management capabilities:

- **Multiple Versions**: Each dataset can have multiple versions
- **Sequential Numbering**: Versions are numbered sequentially (1, 2, 3, etc.)
- **Status Tracking**: Each version has a status (draft, review, published, rejected)
- **Version History**: Complete version history is displayed on the dataset detail page
- **Version Comments**: Comments can be added to each version to describe changes

### 2. New Version Creation

Users can create new versions of a dataset through a user-friendly interface:

- **File Upload**: Upload a new file to create a new version
- **Column Validation**: System validates that the new file has the same columns as the original dataset
- **Version Comments**: Add comments to describe what changed in the new version
- **Status Management**: New versions start in "draft" status

### 3. Version-Specific File Storage

The system stores files for each version in a dedicated directory structure:

- **Version Directories**: Each version's file is stored in a separate directory
- **Path Tracking**: File paths are tracked in the database for each version
- **Consistent Access**: Files can be accessed consistently regardless of version

## Implementation Details

### API Endpoints

#### `/api/datasets/[id]/versions`

**GET Method**:
- Retrieves all versions of a specific dataset
- Returns version details including number, status, comments, and timestamps
- Sorted by version number (newest first)

**POST Method**:
- Creates a new version of a dataset
- Accepts a file upload and optional comments
- Validates file format, size, and column structure
- Returns the newly created version details

### Database Schema

The system uses the following MongoDB schemas:

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

#### NewVersionDialog

Client-side component for creating new versions:

```tsx
interface NewVersionDialogProps {
  datasetId: string;
  onSuccess?: () => void;
}

export default function NewVersionDialog({ datasetId, onSuccess }: NewVersionDialogProps) {
  // Implementation details...
}
```

#### NewVersionForm

Form component for uploading new versions:

```tsx
interface NewVersionFormProps {
  datasetId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function NewVersionForm({ datasetId, onSuccess, onCancel }: NewVersionFormProps) {
  // Implementation details...
}
```

## User Flow

### Creating a New Version

1. User navigates to the dataset detail page
2. User clicks the "New Version" button in the version history section
3. User uploads a new file and adds optional comments
4. System validates the file and creates a new version
5. User receives a success notification
6. The page refreshes to show the updated version history

### Viewing Version History

1. User navigates to the dataset detail page
2. User views the version history section
3. User can see all versions with their status, creation date, and comments

## Security and Validation

- Only users with appropriate permissions can create new versions
- File validation ensures that new versions maintain data integrity
- Column structure validation prevents breaking changes between versions
- File size limits prevent uploading excessively large files

## Future Enhancements

- Version comparison to highlight differences between versions
- Version rollback to revert to a previous version
- Automatic version creation based on scheduled updates
- Version tagging for better organization
- Version-specific metadata to track changes in metadata 