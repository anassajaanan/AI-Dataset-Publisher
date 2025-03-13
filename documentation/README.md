# Dataset Publishing Platform - Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features Implemented](#features-implemented)
3. [Project Structure](#project-structure)
4. [Component Architecture](#component-architecture)
5. [API Endpoints](#api-endpoints)
6. [Database Schema](#database-schema)
7. [Workflow](#workflow)
8. [Future Enhancements](#future-enhancements)

## Project Overview

The Dataset Publishing Platform is a modern web application that enables users to upload, process, validate, and publish datasets with AI-powered metadata generation. The platform supports CSV and Excel files and provides a complete workflow from upload to publication with supervisor review.

**Key Capabilities:**
- Upload and process datasets (CSV and Excel)
- AI-powered metadata generation with bilingual support (English/Arabic)
- Multi-step publishing workflow with versioning
- Supervisor review system
- Dashboard for dataset management

**Tech Stack:**
- Next.js 14 (App Router)
- TypeScript
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- Axios for API requests
- React Dropzone for file uploads
- XLSX and PapaParse for file processing

## Features Implemented

### 1. Dataset Upload and Processing System

- **File Upload Component**
  - Drag-and-drop interface with React Dropzone
  - File type validation (CSV and Excel only)
  - Visual feedback during upload and processing

- **File Processing Service**
  - CSV and Excel file parsing
  - Extraction of row count, column names, and file size
  - Error handling for invalid files

- **Preview Component**
  - Display of file statistics (rows, columns, size)
  - Clean UI with proper formatting

- **Database Integration**
  - Storage of dataset metadata
  - Version tracking

### 2. AI-Powered Metadata Generation

- **Metadata Generation Service**
  - Simulated AI integration (ready for real AI API)
  - Generation of title, description, tags, and category
  - Bilingual support (English and Arabic)

- **Metadata Editor UI**
  - Tabbed interface for English and Arabic content
  - Form validation
  - Tag management system
  - Draft saving functionality

### 3. Publishing Workflow and Review System

- **Multi-step Publishing Workflow**
  - Dataset upload → Metadata generation → Review → Publication

- **Dataset Detail View**
  - Comprehensive dataset information display
  - Metadata preview
  - Version history

- **Submission System**
  - Validation before submission
  - Comments for reviewers
  - Status tracking

- **Dashboard**
  - List of all datasets with filtering and search
  - Status indicators
  - Quick actions

## Project Structure

```
dataset-publishing-platform/
├── prisma/                  # Database schema and migrations
│   └── schema.prisma        # Prisma schema definition
├── public/                  # Static assets
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/             # API routes
│   │   │   ├── datasets/    # Dataset-related endpoints
│   │   │   ├── metadata/    # Metadata generation endpoint
│   │   │   └── upload/      # File upload endpoint
│   │   ├── dashboard/       # Dashboard page
│   │   ├── datasets/        # Dataset-related pages
│   │   │   └── [id]/        # Dynamic dataset pages
│   │   │       ├── metadata/# Metadata editing page
│   │   │       └── submit/  # Submission page
│   │   └── upload/          # Upload page
│   ├── components/          # React components
│   │   ├── dashboard/       # Dashboard components
│   │   ├── metadata/        # Metadata-related components
│   │   ├── preview/         # File preview components
│   │   └── upload/          # Upload components
│   └── lib/                 # Utility functions and services
│       └── services/        # Business logic services
│           ├── ai/          # AI-related services
│           └── fileProcessingService.ts # File processing logic
├── .env                     # Environment variables
├── package.json             # Dependencies and scripts
└── documentation/           # Project documentation
```

## Component Architecture

### File Upload Flow

```
FileUpload Component
├── Drag-and-drop interface
├── File validation
├── API call to /api/upload
└── Display FilePreview on success

FilePreview Component
├── Display file statistics
└── "Continue to Metadata" button
```

### Metadata Generation Flow

```
MetadataEditor Component
├── Language selector (EN/AR)
├── AI generation button
├── Tabbed interface (English/Arabic)
├── Form fields for metadata
├── Tag management
└── Save/Submit buttons

API Integration
├── Call to /api/metadata for generation
└── Call to /api/datasets/[id]/metadata for saving
```

### Dashboard Flow

```
DatasetList Component
├── Search and filter controls
├── Table of datasets
└── Status indicators and actions

Dataset Detail Page
├── File information
├── Metadata display
├── Version history
└── Action buttons (Edit/Submit)
```

## API Endpoints

### Dataset Management

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/upload` | POST | Upload and process a dataset file | FormData with file | `{ fileStats, datasetId }` |
| `/api/datasets` | GET | Get list of datasets with optional filtering | Query params: status, search | `{ datasets: Dataset[] }` |
| `/api/datasets/[id]` | GET | Get a specific dataset by ID | - | `{ dataset: Dataset }` |
| `/api/datasets/[id]/metadata` | GET | Get metadata for a dataset | - | `{ metadata: DatasetMetadata }` |
| `/api/datasets/[id]/metadata` | PUT | Update metadata for a dataset | `{ metadata: {...} }` | `{ metadata: DatasetMetadata }` |
| `/api/datasets/[id]/submit` | POST | Submit a dataset for review | `{ versionId, comments }` | `{ success: boolean }` |

### Metadata Generation

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/metadata` | POST | Generate metadata using AI | `{ datasetId, language }` | `{ metadata: GeneratedMetadata }` |

## Database Schema

### Dataset Model
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

### DatasetVersion Model
```prisma
model DatasetVersion {
  id          String    @id @default(uuid())
  versionNumber Int
  filePath    String
  status      String    // "draft", "pending_review", "approved", "published", "rejected"
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  dataset     Dataset   @relation(fields: [datasetId], references: [id])
  datasetId   String
  metadata    DatasetMetadata?
}
```

### DatasetMetadata Model
```prisma
model DatasetMetadata {
  id              String          @id @default(uuid())
  title           String
  titleArabic     String?
  description     String
  descriptionArabic String?
  tags            String[]
  category        String
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  dataset         Dataset         @relation(fields: [datasetId], references: [id])
  datasetId       String
  version         DatasetVersion? @relation(fields: [versionId], references: [id])
  versionId       String?         @unique
  isAIGenerated   Boolean         @default(true)
}
```

### User Model
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

## Workflow

The Dataset Publishing Platform implements a complete workflow for dataset management:

1. **Upload Phase**
   - User uploads a CSV or Excel file
   - System validates and processes the file
   - File statistics are displayed to the user
   - Dataset is saved to the database with "draft" status

2. **Metadata Phase**
   - User can generate metadata using AI
   - System supports bilingual metadata (English/Arabic)
   - User can edit and save metadata
   - Metadata is saved to the database

3. **Review Phase**
   - User submits the dataset for review
   - Supervisor can approve or reject the dataset
   - Comments can be added during submission

4. **Publication Phase**
   - Approved datasets are published
   - Published datasets are available for viewing

## Future Enhancements

1. **Authentication and Authorization**
   - User registration and login
   - Role-based access control

2. **Advanced AI Integration**
   - Integration with OpenAI or other AI providers
   - More sophisticated metadata generation

3. **File Storage**
   - Integration with cloud storage (S3, Azure Blob, etc.)
   - Secure file handling

4. **Collaboration Features**
   - Comments and discussions
   - Notifications

5. **Analytics**
   - Dataset usage statistics
   - User activity tracking

6. **Export Options**
   - Download datasets in various formats
   - API access to datasets 