# Dataset Publishing Platform - Workflow Documentation

This document outlines the complete workflow and user journey for the Dataset Publishing Platform, detailing each step from dataset upload to publication.

## Overview

The Dataset Publishing Platform implements a structured workflow that guides users through the process of uploading, enriching, and publishing datasets. The workflow is designed to ensure data quality, proper documentation, and appropriate review before datasets become publicly available.

## User Roles

The platform supports three primary user roles:

1. **Data Provider**: Users who upload and prepare datasets
2. **Reviewer**: Supervisors who review and approve/reject datasets
3. **Administrator**: Users with full system access and management capabilities

## Complete Workflow Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Upload   │     │   Metadata  │     │   Submit    │     │    Review   │     │   Publish   │
│    Phase    │────►│    Phase    │────►│    Phase    │────►│    Phase    │────►│    Phase    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  File       │     │  Generate/  │     │  Validation │     │  Reviewer   │     │  Dataset    │
│  Processing │     │  Edit       │     │  & Submit   │     │  Decision   │     │  Available  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

## Detailed Workflow Steps

### 1. Upload Phase

**User Role**: Data Provider

**Steps**:
1. User navigates to the upload page
2. User drags and drops a CSV or Excel file into the upload area
3. System validates the file format and size
4. System processes the file to extract:
   - Row count
   - Column names
   - File size
5. System creates a new dataset record with "draft" status
6. System displays file statistics to the user
7. User reviews the file statistics and proceeds to the metadata phase

**Status**: Dataset is created with initial version in "draft" status

**Technical Implementation**:
- Frontend: `FileUpload` component with React Dropzone
- Backend: `/api/upload` endpoint processes the file
- Database: Creates `Dataset` and `DatasetVersion` records

**Error Handling**:
- Invalid file format: User is prompted to upload a valid CSV or Excel file
- File too large: User is informed of the file size limit
- Processing error: User is shown an error message with retry option

### 2. Metadata Phase

**User Role**: Data Provider

**Steps**:
1. User is presented with the metadata editor
2. User can choose to:
   - Manually enter metadata
   - Generate metadata using AI
3. If generating with AI:
   - User selects language (English or Arabic)
   - System generates metadata using AI
   - User can edit the generated metadata
4. User enters/edits metadata fields:
   - Title (English and Arabic)
   - Description (English and Arabic)
   - Tags
   - Category
5. User saves the metadata
6. System validates the metadata for required fields
7. System associates the metadata with the dataset

**Status**: Dataset remains in "draft" status with metadata added

**Technical Implementation**:
- Frontend: `MetadataEditor` component with tabbed interface
- Backend: 
  - `/api/metadata` endpoint for AI generation
  - `/api/datasets/[id]/metadata` endpoint for saving
- Database: Creates or updates `DatasetMetadata` record

**Error Handling**:
- Missing required fields: User is prompted to complete all required fields
- AI generation failure: User is informed and can try again or enter manually
- Save failure: User is shown an error message with retry option

### 3. Submit Phase

**User Role**: Data Provider

**Steps**:
1. User navigates to the dataset detail page
2. User reviews the dataset information and metadata
3. User clicks "Submit for Review" button
4. System validates that all required metadata is present
5. User is presented with a submission form
6. User can add optional comments for the reviewer
7. User submits the dataset for review
8. System updates the dataset status to "pending_review"
9. User is redirected to the dataset detail page with updated status

**Status**: Dataset version is updated to "pending_review" status

**Technical Implementation**:
- Frontend: `SubmitForm` component
- Backend: `/api/datasets/[id]/submit` endpoint
- Database: Updates `DatasetVersion` status

**Error Handling**:
- Missing metadata: User is informed that metadata is required before submission
- Submission failure: User is shown an error message with retry option

### 4. Review Phase

**User Role**: Reviewer

**Steps**:
1. Reviewer logs into the platform
2. Reviewer sees a list of datasets pending review
3. Reviewer selects a dataset to review
4. Reviewer examines:
   - Dataset content
   - Metadata quality
   - Compliance with guidelines
5. Reviewer makes a decision:
   - Approve: Dataset is ready for publication
   - Reject: Dataset needs improvements
6. Reviewer can add comments explaining the decision
7. System updates the dataset status based on the decision

**Status**: Dataset version is updated to either "approved" or "rejected" status

**Technical Implementation**:
- Frontend: Review interface with dataset preview and decision buttons
- Backend: Review decision API endpoint
- Database: Updates `DatasetVersion` status

**Error Handling**:
- Decision submission failure: Reviewer is shown an error message with retry option

### 5. Publication Phase

**User Role**: Data Provider or Administrator

**Steps**:
1. For approved datasets:
   - User receives notification of approval
   - User navigates to the dataset detail page
   - User clicks "Publish" button
   - System updates the dataset status to "published"
   - Dataset becomes publicly available
2. For rejected datasets:
   - User receives notification of rejection with comments
   - User makes necessary improvements
   - User can resubmit the dataset (creating a new version)

**Status**: Dataset version is updated to "published" status (if approved)

**Technical Implementation**:
- Frontend: Publication confirmation dialog
- Backend: Publication API endpoint
- Database: Updates `DatasetVersion` status

**Error Handling**:
- Publication failure: User is shown an error message with retry option

## User Journey Examples

### Example 1: Successful Publication Journey

1. **Upload**:
   - User uploads "city_population.csv"
   - System processes the file and shows statistics: 150 rows, 5 columns, 32KB

2. **Metadata**:
   - User clicks "Generate Metadata" for English
   - AI generates title "City Population Dataset" and description
   - User adds tags: "population", "cities", "demographics"
   - User selects category "Government"
   - User saves the metadata

3. **Submit**:
   - User reviews the dataset details and metadata
   - User clicks "Submit for Review"
   - User adds comment: "This dataset contains the latest population figures"
   - User submits the dataset

4. **Review**:
   - Reviewer examines the dataset and metadata
   - Reviewer approves the dataset
   - Reviewer adds comment: "Well-structured dataset with complete metadata"

5. **Publish**:
   - User receives approval notification
   - User publishes the dataset
   - Dataset becomes publicly available

### Example 2: Rejection and Resubmission Journey

1. **Upload**:
   - User uploads "financial_data.xlsx"
   - System processes the file and shows statistics: 500 rows, 10 columns, 120KB

2. **Metadata**:
   - User manually enters minimal metadata
   - User saves the metadata

3. **Submit**:
   - User submits the dataset for review

4. **Review**:
   - Reviewer finds issues with the metadata
   - Reviewer rejects the dataset
   - Reviewer adds comment: "Metadata is incomplete. Please add more descriptive tags and improve the description."

5. **Revision**:
   - User receives rejection notification
   - User improves the metadata
   - User resubmits the dataset

6. **Review (Second Round)**:
   - Reviewer approves the improved dataset

7. **Publish**:
   - User publishes the dataset
   - Dataset becomes publicly available

## Status Transitions

The following diagram illustrates the possible status transitions for a dataset version:

```
                    ┌─────────────┐
                    │    Draft    │
                    └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
┌───────────────────┤   Pending   │
│                   │   Review    │
│                   └─────────────┘
│                           │
│                           ▼
│                    ┌─────────────┐     ┌─────────────┐
└───────────────────►│   Rejected  │     │  Approved   │
                    └─────────────┘     └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  Published  │
                                        └─────────────┘
```

**Status Transition Rules**:
1. **Draft → Pending Review**: When user submits the dataset for review
2. **Pending Review → Approved**: When reviewer approves the dataset
3. **Pending Review → Rejected**: When reviewer rejects the dataset
4. **Rejected → Pending Review**: When user resubmits after addressing issues
5. **Approved → Published**: When user or admin publishes the dataset

## Notifications

The platform includes notifications at key workflow transitions:

1. **Submission Notification**: Alerts reviewers when a new dataset is submitted
2. **Review Decision Notification**: Informs users when their dataset is approved or rejected
3. **Publication Notification**: Confirms successful publication to users

## Versioning

The platform supports dataset versioning:

1. **Version Creation**:
   - Initial upload creates version 1
   - Resubmission after rejection creates a new version

2. **Version Tracking**:
   - Each version maintains its own status
   - Version history is displayed on the dataset detail page

3. **Version Metadata**:
   - Each version can have its own metadata
   - Metadata can be copied from previous versions

## Workflow Configuration

The workflow can be configured by administrators:

1. **Required Metadata Fields**: Customize which metadata fields are required
2. **Review Requirements**: Set criteria for dataset approval
3. **Auto-approval Rules**: Configure rules for automatic approval of certain datasets

## Future Workflow Enhancements

1. **Multi-level Review**: Implement multiple review stages for sensitive datasets
2. **Scheduled Publication**: Allow users to schedule publication for a future date
3. **Approval Expiration**: Set expiration dates for approved but unpublished datasets
4. **Batch Operations**: Enable bulk upload, review, and publication of multiple datasets
5. **Workflow Templates**: Create predefined workflow templates for different dataset types 