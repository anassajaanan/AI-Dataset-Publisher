# Dataset Publishing Platform - Database Documentation

This document provides detailed information about the database schema, models, and relationships used in the Dataset Publishing Platform.

## Database Technology

The Dataset Publishing Platform uses:

- **PostgreSQL**: A powerful, open-source object-relational database system
- **Prisma ORM**: Next-generation ORM for Node.js and TypeScript

## Schema Overview

The database schema consists of the following main models:

1. **Dataset**: Represents a dataset uploaded to the platform
2. **DatasetVersion**: Represents a specific version of a dataset
3. **DatasetMetadata**: Contains metadata information for a dataset
4. **User**: Represents a user of the platform (for future authentication)

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────────┐       ┌───────────────────┐
│   Dataset   │       │ DatasetVersion  │       │  DatasetMetadata  │
├─────────────┤       ├─────────────────┤       ├───────────────────┤
│ id          │       │ id              │       │ id                │
│ filename    │       │ versionNumber   │       │ title             │
│ fileSize    │       │ filePath        │       │ titleArabic       │
│ rowCount    │       │ status          │       │ description       │
│ columns     │       │ createdAt       │       │ descriptionArabic │
│ createdAt   │◄──────│ datasetId       │       │ tags              │
│ updatedAt   │       │ updatedAt       │       │ category          │
└─────────────┘       └─────────────────┘       │ isAIGenerated     │
                                │                │ createdAt         │
                                │                │ updatedAt         │
                                │                │ datasetId         │◄─────┐
                                └────────────────► versionId         │      │
                                                 └───────────────────┘      │
                                                                            │
                                                                            │
┌─────────────┐                                                             │
│    User     │                                                             │
├─────────────┤                                                             │
│ id          │                                                             │
│ name        │                                                             │
│ email       │                                                             │
│ role        │                                                             │
│ createdAt   │                                                             │
│ updatedAt   │                                                             │
└─────────────┘                                                             │
                                                                            │
                                                                            │
                                 ┌─────────────┐                            │
                                 │   Dataset   │                            │
                                 ├─────────────┤                            │
                                 │ id          │────────────────────────────┘
                                 │ filename    │
                                 │ fileSize    │
                                 │ rowCount    │
                                 │ columns     │
                                 │ createdAt   │
                                 │ updatedAt   │
                                 └─────────────┘
```

## Detailed Model Definitions

### Dataset Model

The Dataset model represents a dataset uploaded to the platform.

```prisma
model Dataset {
  id          String            @id @default(uuid())
  filename    String
  fileSize    Int
  rowCount    Int
  columns     String[]
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  versions    DatasetVersion[]
  metadata    DatasetMetadata[]
}
```

**Fields:**
- `id`: Unique identifier (UUID)
- `filename`: Original filename of the uploaded dataset
- `fileSize`: Size of the file in bytes
- `rowCount`: Number of rows in the dataset
- `columns`: Array of column names in the dataset
- `createdAt`: Timestamp when the dataset was created
- `updatedAt`: Timestamp when the dataset was last updated
- `versions`: Relation to DatasetVersion model (one-to-many)
- `metadata`: Relation to DatasetMetadata model (one-to-many)

### DatasetVersion Model

The DatasetVersion model represents a specific version of a dataset.

```prisma
model DatasetVersion {
  id            String           @id @default(uuid())
  versionNumber Int
  filePath      String
  status        String           // "draft", "pending_review", "approved", "published", "rejected"
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt
  dataset       Dataset          @relation(fields: [datasetId], references: [id])
  datasetId     String
  metadata      DatasetMetadata?
}
```

**Fields:**
- `id`: Unique identifier (UUID)
- `versionNumber`: Sequential version number (1, 2, 3, etc.)
- `filePath`: Path to the stored file
- `status`: Current status of the version (draft, pending_review, approved, published, rejected)
- `createdAt`: Timestamp when the version was created
- `updatedAt`: Timestamp when the version was last updated
- `dataset`: Relation to Dataset model (many-to-one)
- `datasetId`: Foreign key to Dataset model
- `metadata`: Relation to DatasetMetadata model (one-to-one)

**Status Values:**
- `draft`: Initial status when a dataset is uploaded
- `pending_review`: Dataset has been submitted for review
- `approved`: Dataset has been approved by a supervisor
- `published`: Dataset has been published and is publicly available
- `rejected`: Dataset has been rejected by a supervisor

### DatasetMetadata Model

The DatasetMetadata model contains metadata information for a dataset.

```prisma
model DatasetMetadata {
  id                String          @id @default(uuid())
  title             String
  titleArabic       String?
  description       String
  descriptionArabic String?
  tags              String[]
  category          String
  isAIGenerated     Boolean         @default(true)
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  dataset           Dataset         @relation(fields: [datasetId], references: [id])
  datasetId         String
  version           DatasetVersion? @relation(fields: [versionId], references: [id])
  versionId         String?         @unique
}
```

**Fields:**
- `id`: Unique identifier (UUID)
- `title`: Title of the dataset (English)
- `titleArabic`: Title of the dataset (Arabic, optional)
- `description`: Description of the dataset (English)
- `descriptionArabic`: Description of the dataset (Arabic, optional)
- `tags`: Array of tags associated with the dataset
- `category`: Category of the dataset
- `isAIGenerated`: Boolean indicating if the metadata was generated by AI
- `createdAt`: Timestamp when the metadata was created
- `updatedAt`: Timestamp when the metadata was last updated
- `dataset`: Relation to Dataset model (many-to-one)
- `datasetId`: Foreign key to Dataset model
- `version`: Relation to DatasetVersion model (one-to-one)
- `versionId`: Foreign key to DatasetVersion model (optional, unique)

### User Model

The User model represents a user of the platform (for future authentication).

```prisma
model User {
  id          String    @id @default(uuid())
  name        String
  email       String    @unique
  role        String    // "user", "supervisor", "admin"
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

**Fields:**
- `id`: Unique identifier (UUID)
- `name`: User's full name
- `email`: User's email address (unique)
- `role`: User's role in the system
- `createdAt`: Timestamp when the user was created
- `updatedAt`: Timestamp when the user was last updated

**Role Values:**
- `user`: Regular user who can upload and manage datasets
- `supervisor`: User who can review and approve/reject datasets
- `admin`: User with full administrative privileges

## Relationships

### One-to-Many Relationships

1. **Dataset to DatasetVersion**:
   - A dataset can have multiple versions
   - Each version belongs to exactly one dataset

2. **Dataset to DatasetMetadata**:
   - A dataset can have multiple metadata records (one per version)
   - Each metadata record belongs to exactly one dataset

### One-to-One Relationships

1. **DatasetVersion to DatasetMetadata**:
   - A version can have at most one metadata record
   - A metadata record can be associated with at most one version

## Indexes and Constraints

- `email` in the User model has a unique constraint
- `versionId` in the DatasetMetadata model has a unique constraint

## Database Migrations

Prisma handles database migrations through the following commands:

1. **Generate Migration**:
   ```bash
   npx prisma migrate dev --name migration_name
   ```

2. **Apply Migrations**:
   ```bash
   npx prisma migrate deploy
   ```

3. **Reset Database**:
   ```bash
   npx prisma migrate reset
   ```

## Data Access Patterns

### Common Queries

1. **Get Latest Version of a Dataset**:
   ```typescript
   const latestVersion = await prisma.datasetVersion.findFirst({
     where: { datasetId: id },
     orderBy: { versionNumber: 'desc' },
     take: 1,
   });
   ```

2. **Get Dataset with Latest Version and Metadata**:
   ```typescript
   const dataset = await prisma.dataset.findUnique({
     where: { id },
     include: {
       versions: {
         orderBy: { versionNumber: 'desc' },
         take: 1,
       },
       metadata: {
         orderBy: { createdAt: 'desc' },
         take: 1,
       },
     },
   });
   ```

3. **Get Datasets by Status**:
   ```typescript
   const datasets = await prisma.dataset.findMany({
     where: {
       versions: {
         some: {
           status,
         },
       },
     },
     include: {
       versions: {
         orderBy: { versionNumber: 'desc' },
         take: 1,
       },
     },
   });
   ```

### Data Integrity

To maintain data integrity:

1. **Cascading Deletes**: Not implemented to prevent accidental data loss
2. **Foreign Key Constraints**: Enforced by the database
3. **Unique Constraints**: Applied to email and versionId fields

## Performance Considerations

1. **Indexing**: Consider adding indexes for frequently queried fields:
   - `status` in DatasetVersion
   - `datasetId` in DatasetVersion and DatasetMetadata

2. **Pagination**: Implement pagination for listing datasets:
   ```typescript
   const datasets = await prisma.dataset.findMany({
     skip: (page - 1) * limit,
     take: limit,
     orderBy: { createdAt: 'desc' },
   });
   ```

3. **Selective Loading**: Only load necessary relations:
   ```typescript
   const dataset = await prisma.dataset.findUnique({
     where: { id },
     select: {
       id: true,
       filename: true,
       // Only select needed fields
     },
   });
   ```

## Future Schema Enhancements

1. **Comments and Feedback**:
   ```prisma
   model Comment {
     id          String    @id @default(uuid())
     content     String
     createdAt   DateTime  @default(now())
     updatedAt   DateTime  @updatedAt
     user        User      @relation(fields: [userId], references: [id])
     userId      String
     dataset     Dataset   @relation(fields: [datasetId], references: [id])
     datasetId   String
     version     DatasetVersion? @relation(fields: [versionId], references: [id])
     versionId   String?
   }
   ```

2. **Dataset Access Control**:
   ```prisma
   model DatasetAccess {
     id          String    @id @default(uuid())
     accessLevel String    // "read", "write", "admin"
     user        User      @relation(fields: [userId], references: [id])
     userId      String
     dataset     Dataset   @relation(fields: [datasetId], references: [id])
     datasetId   String
     createdAt   DateTime  @default(now())
     updatedAt   DateTime  @updatedAt
     
     @@unique([userId, datasetId])
   }
   ```

3. **Usage Analytics**:
   ```prisma
   model DatasetUsage {
     id          String    @id @default(uuid())
     accessType  String    // "view", "download", "api"
     timestamp   DateTime  @default(now())
     user        User?     @relation(fields: [userId], references: [id])
     userId      String?
     dataset     Dataset   @relation(fields: [datasetId], references: [id])
     datasetId   String
   }
   