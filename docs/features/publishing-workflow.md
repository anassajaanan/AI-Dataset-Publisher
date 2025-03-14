# Publishing Workflow and Review System

This document describes the publishing workflow and review system feature of the Dataset Publishing Platform.

## Overview

The publishing workflow and review system feature provides a structured process for dataset publication, with multiple steps from initial upload to final publication. The feature includes a supervisor review interface for approving or requesting changes to datasets, with version history tracking for dataset changes. The workflow is designed to ensure data quality and metadata accuracy before publication.

## User Flow

### Dataset Creator Flow

1. User uploads a dataset file
2. User edits and saves metadata for the dataset
3. User reviews the dataset and metadata
4. User submits the dataset for review
5. User receives notification when the dataset is approved or rejected
6. If rejected, user makes the requested changes and resubmits
7. If approved, the dataset is published and available to users

### Supervisor Flow

1. Supervisor receives notification of a dataset pending review
2. Supervisor reviews the dataset and metadata
3. Supervisor approves the dataset or requests changes
4. If changes are requested, supervisor provides feedback
5. When the dataset is resubmitted, supervisor reviews the changes
6. When approved, the dataset is published automatically

## Components

### Workflow Steps Component

The workflow steps component displays the current step in the publishing workflow, with indicators for completed, current, and upcoming steps. It provides navigation between steps and prevents access to steps that are not yet available.

![Workflow Steps Component](../assets/workflow-steps.png)

### Review Interface Component

The review interface component displays the dataset and metadata for review, with options to approve or request changes. It includes a comment field for providing feedback and a history of previous review actions.

![Review Interface Component](../assets/review-interface.png)

### Dataset Dashboard Component

The dataset dashboard component displays a list of datasets with their current status, allowing users to filter and search for datasets. It provides quick access to dataset details and actions based on the dataset's status.

![Dataset Dashboard Component](../assets/dataset-dashboard.png)

## API Endpoints

### Update Dataset Status

```
PATCH /api/datasets/:datasetId/status
```

Updates the status of a dataset.

#### Request

```json
{
  "status": "pending_review",
  "comment": "Ready for supervisor review"
}
```

#### Response

**Success (200 OK)**

```json
{
  "success": true,
  "data": {
    "id": "64f7e8a12b3c4d5e6f7a8b9c",
    "status": "pending_review",
    "previousStatus": "draft",
    "updatedAt": "2023-09-05T16:30:45Z",
    "updatedBy": "user123"
  }
}
```

### Publish Dataset

```
POST /api/datasets/:datasetId/publish
```

Publishes a dataset, making it available to users.

#### Request

```json
{
  "reviewComment": "Approved for publication",
  "notifyCreator": true
}
```

#### Response

**Success (200 OK)**

```json
{
  "success": true,
  "data": {
    "id": "64f7e8a12b3c4d5e6f7a8b9c",
    "status": "published",
    "previousStatus": "pending_review",
    "publishedAt": "2023-09-05T16:45:30Z",
    "publishedBy": "supervisor456",
    "version": 2
  }
}
```

### Get Dataset Versions

```
GET /api/datasets/:datasetId/versions
```

Retrieves the version history of a dataset.

#### Response

**Success (200 OK)**

```json
{
  "success": true,
  "data": {
    "versions": [
      {
        "version": 2,
        "status": "published",
        "updatedAt": "2023-09-05T16:45:30Z",
        "updatedBy": "user123",
        "changes": ["Updated metadata", "Fixed column names"]
      },
      {
        "version": 1,
        "status": "published",
        "updatedAt": "2023-09-01T10:30:15Z",
        "updatedBy": "user123",
        "changes": ["Initial publication"]
      }
    ]
  }
}
```

## Implementation Details

### Workflow States

The publishing workflow includes the following states:

1. **Draft**: The dataset is being created and edited by the user
2. **Pending Review**: The dataset has been submitted for review by a supervisor
3. **Changes Requested**: The supervisor has requested changes to the dataset
4. **Approved**: The dataset has been approved by a supervisor
5. **Published**: The dataset is published and available to users
6. **Rejected**: The dataset has been rejected and is not available to users

### State Transitions

The following state transitions are allowed:

- Draft → Pending Review (User submits for review)
- Pending Review → Approved (Supervisor approves)
- Pending Review → Changes Requested (Supervisor requests changes)
- Changes Requested → Pending Review (User resubmits after changes)
- Approved → Published (Automatic or manual publication)
- Pending Review → Rejected (Supervisor rejects)

### Version Control

The feature includes version control for datasets, with the following approach:

1. Each dataset has a version number, starting at 1
2. When a dataset is updated after publication, a new version is created
3. The version number is incremented for each published version
4. Previous versions are stored in the database for reference
5. Users can view the version history and differences between versions

### Notification System

The feature includes a notification system to keep users informed about the status of their datasets:

1. Users receive notifications when their datasets are approved or rejected
2. Supervisors receive notifications when datasets are submitted for review
3. Users receive notifications when changes are requested for their datasets
4. Notifications are delivered via email and in-app messages
5. Users can configure their notification preferences

## Configuration Options

The feature can be configured with the following options:

- Workflow steps and states
- Required approvals for publication
- Automatic publication after approval
- Notification settings
- Review criteria and checklists
- Version control settings

## Security Considerations

The feature implements several security measures:

- Role-based access control for review and publication
- Audit logging for all status changes
- Validation of state transitions
- Prevention of unauthorized status changes
- Secure storage of review comments and feedback

## Performance Considerations

The feature is optimized for performance:

- Efficient state management to minimize database queries
- Caching of dataset status and version information
- Asynchronous notification delivery
- Pagination for version history and review comments
- Optimized queries for dashboard and listing views

## Accessibility

The feature is designed with accessibility in mind:

- Keyboard navigation for all interactive elements
- Screen reader support with ARIA attributes
- High contrast mode for visually impaired users
- Clear status indicators with both color and text
- Descriptive error messages and feedback

## Future Enhancements

Planned enhancements for the feature include:

- Multi-level approval workflow with multiple reviewers
- Customizable workflow steps for different dataset types
- Advanced version comparison tools
- Scheduled publication dates
- Integration with external review systems 