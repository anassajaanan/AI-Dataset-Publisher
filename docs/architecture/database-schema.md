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
  "filename": "String",
  "fileSize": "Number",
  "rowCount": "Number",
  "columns": ["String"],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### DatasetVersions Collection

Stores version information for datasets.

```json
{
  "_id": "ObjectId",
  "datasetId": "ObjectId (ref: Datasets)",
  "versionNumber": "Number",
  "filePath": "String",
  "status": "String (enum: 'draft', 'review', 'published', 'rejected')",
  "comments": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### DatasetMetadata Collection

Stores metadata for datasets, with support for bilingual content.

```json
{
  "_id": "ObjectId",
  "datasetId": "ObjectId (ref: Datasets)",
  "versionId": "ObjectId (ref: DatasetVersions)",
  "title": "String",
  "titleArabic": "String",
  "description": "String",
  "descriptionArabic": "String",
  "keywords": ["String"],
  "license": "String",
  "author": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
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
└─────────────┘       └──────┬──────┘       └──────┬──────┘
       ▲                     │                     │
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
                      
                      ┌─────────────┐
                      │DatasetMetadata│
                      └─────────────┘
                            ▲
                            │
                            │
                      ┌─────────────┐
                      │   Datasets  │
                      └─────────────┘
```

## Indexes

The following indexes are created to optimize query performance:

### Users Collection

- `email`: Unique index for user lookup by email
- `role`: Index for filtering users by role

### Datasets Collection

- `createdAt`: Index for sorting datasets by creation date
- `updatedAt`: Index for sorting datasets by update date

### DatasetVersions Collection

- `datasetId`: Index for filtering versions by dataset
- `versionNumber`: Index for filtering by version number
- `status`: Index for filtering by status

### DatasetMetadata Collection

- `datasetId`: Index for filtering metadata by dataset
- `versionId`: Index for filtering metadata by version
- `updatedAt`: Index for sorting metadata by update date

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