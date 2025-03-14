# Database Schema

This document describes the database schema for the Dataset Publishing Platform, which uses MongoDB as its database.

## Overview

The database schema is designed to support the core functionality of the platform, including dataset management, metadata management, user management, and workflow management. The schema follows MongoDB's document-oriented approach, with collections representing different entity types and documents representing individual entities.

## Collections

### Users Collection

Stores information about users of the platform.

```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String",
  "password": "String (hashed)",
  "role": "String (enum: 'user', 'supervisor', 'admin')",
  "createdAt": "Date",
  "updatedAt": "Date",
  "lastLogin": "Date",
  "settings": {
    "language": "String (enum: 'en', 'ar')",
    "notifications": "Boolean",
    "theme": "String (enum: 'light', 'dark', 'system')"
  }
}
```

### Datasets Collection

Stores information about datasets uploaded to the platform.

```json
{
  "_id": "ObjectId",
  "title": "String",
  "description": "String",
  "category": "String",
  "tags": ["String"],
  "status": "String (enum: 'draft', 'pending_review', 'published', 'rejected')",
  "createdBy": "ObjectId (ref: Users)",
  "createdAt": "Date",
  "updatedAt": "Date",
  "publishedAt": "Date",
  "reviewedBy": "ObjectId (ref: Users)",
  "reviewComment": "String",
  "version": "Number",
  "fileInfo": {
    "fileName": "String",
    "fileSize": "Number",
    "fileType": "String",
    "filePath": "String",
    "rowCount": "Number",
    "columnNames": ["String"]
  },
  "metadata": {
    "title": "String",
    "description": "String",
    "category": "String",
    "tags": ["String"],
    "language": "String (enum: 'en', 'ar')",
    "generatedAt": "Date",
    "confidence": {
      "title": "Number",
      "description": "Number",
      "category": "Number",
      "tags": "Number"
    }
  }
}
```

### DatasetVersions Collection

Stores version history for datasets.

```json
{
  "_id": "ObjectId",
  "datasetId": "ObjectId (ref: Datasets)",
  "version": "Number",
  "title": "String",
  "description": "String",
  "category": "String",
  "tags": ["String"],
  "status": "String (enum: 'draft', 'pending_review', 'published', 'rejected')",
  "createdBy": "ObjectId (ref: Users)",
  "createdAt": "Date",
  "fileInfo": {
    "fileName": "String",
    "fileSize": "Number",
    "fileType": "String",
    "filePath": "String",
    "rowCount": "Number",
    "columnNames": ["String"]
  },
  "metadata": {
    "title": "String",
    "description": "String",
    "category": "String",
    "tags": ["String"],
    "language": "String (enum: 'en', 'ar')"
  },
  "changes": ["String"]
}
```

### MetadataDrafts Collection

Stores draft metadata for datasets.

```json
{
  "_id": "ObjectId",
  "datasetId": "ObjectId (ref: Datasets)",
  "createdBy": "ObjectId (ref: Users)",
  "createdAt": "Date",
  "updatedAt": "Date",
  "metadata": {
    "title": "String",
    "description": "String",
    "category": "String",
    "tags": ["String"],
    "language": "String (enum: 'en', 'ar')"
  }
}
```

### Reviews Collection

Stores review information for datasets.

```json
{
  "_id": "ObjectId",
  "datasetId": "ObjectId (ref: Datasets)",
  "version": "Number",
  "reviewerId": "ObjectId (ref: Users)",
  "createdAt": "Date",
  "updatedAt": "Date",
  "status": "String (enum: 'pending', 'approved', 'rejected')",
  "comment": "String",
  "changes": [{
    "field": "String",
    "oldValue": "Mixed",
    "newValue": "Mixed"
  }]
}
```

### Activities Collection

Stores activity logs for auditing and tracking.

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: Users)",
  "action": "String (enum: 'create', 'update', 'delete', 'publish', 'review', etc.)",
  "resourceType": "String (enum: 'dataset', 'metadata', 'user', etc.)",
  "resourceId": "ObjectId",
  "details": "Object",
  "createdAt": "Date",
  "ipAddress": "String"
}
```

## Relationships

The following diagram illustrates the relationships between the collections:

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    Users    │◄──────┤   Datasets  │──────►│DatasetVersions│
└─────────────┘       └──────┬──────┘       └─────────────┘
       ▲                     │                     ▲
       │                     │                     │
       │                     ▼                     │
       │              ┌─────────────┐              │
       └──────────────┤   Reviews   │──────────────┘
                      └─────────────┘
                            ▲
                            │
                            │
                      ┌─────────────┐
                      │  Activities │
                      └─────────────┘
```

## Indexes

The following indexes are created to optimize query performance:

### Users Collection

- `email`: Unique index for user lookup by email
- `role`: Index for filtering users by role

### Datasets Collection

- `createdBy`: Index for filtering datasets by creator
- `status`: Index for filtering datasets by status
- `tags`: Index for filtering datasets by tags
- `category`: Index for filtering datasets by category
- `createdAt`: Index for sorting datasets by creation date
- `updatedAt`: Index for sorting datasets by update date

### DatasetVersions Collection

- `datasetId`: Index for filtering versions by dataset
- `version`: Index for filtering by version number

### MetadataDrafts Collection

- `datasetId`: Index for filtering drafts by dataset
- `createdBy`: Index for filtering drafts by creator

### Reviews Collection

- `datasetId`: Index for filtering reviews by dataset
- `reviewerId`: Index for filtering reviews by reviewer
- `status`: Index for filtering reviews by status

### Activities Collection

- `userId`: Index for filtering activities by user
- `resourceType`: Index for filtering activities by resource type
- `resourceId`: Index for filtering activities by resource
- `createdAt`: Index for sorting activities by creation date

## Data Validation

MongoDB schema validation is used to ensure data integrity. The validation rules enforce the following constraints:

- Required fields must be present
- Fields must have the correct data types
- Enum fields must have valid values
- Numeric fields must be within valid ranges
- Date fields must be valid dates

## Data Migration

Data migration scripts are provided for schema changes and updates. These scripts handle:

- Adding new fields with default values
- Removing deprecated fields
- Transforming field values
- Moving data between collections

## Backup and Recovery

The database is backed up regularly to ensure data durability. The backup strategy includes:

- Daily full backups
- Hourly incremental backups
- Point-in-time recovery
- Geo-redundant storage

## Performance Considerations

The schema is designed with performance in mind, following these principles:

- Denormalization where appropriate to reduce joins
- Indexing for common query patterns
- Limiting array sizes to prevent document growth
- Using appropriate data types for storage efficiency
- Pagination for large result sets 