# Dataset Publishing Platform Documentation

## Overview

The Dataset Publishing Platform is a modern web application that allows users to upload, process, validate, and publish datasets with AI-powered metadata generation and a comprehensive review workflow.

## Table of Contents

- [Features](./features/README.md)
  - [Dataset Upload and Processing](./features/upload-processing.md)
  - [AI-Powered Metadata Generation](./features/metadata-generation.md)
  - [Publishing Workflow and Review System](./features/publishing-workflow.md)

- [API Documentation](./api/README.md)
  - [Upload API](./api/upload.md)
  - [Metadata API](./api/metadata.md)
  - [Datasets API](./api/datasets.md)

- [Component Documentation](./components/README.md)
  - [Upload Components](./components/upload.md)
  - [Preview Components](./components/preview.md)
  - [Metadata Components](./components/metadata.md)
  - [Dashboard Components](./components/dashboard.md)

- [Architecture](./architecture/README.md)
  - [System Architecture](./architecture/system-architecture.md)
  - [Database Schema](./architecture/database-schema.md)
  - [State Management](./architecture/state-management.md)
  - [Authentication and Authorization](./architecture/auth.md)
  - [Error Handling](./architecture/error-handling.md)
  - [Internationalization](./architecture/internationalization.md)

- [Implementation Progress](./implementation-progress.md)
  - Tracks completed and pending tasks from the SRS

## Getting Started

To set up the project locally, please refer to the main [README.md](../README.md) file in the project root.

## MongoDB Setup

For database setup instructions, please refer to the [MONGODB_SETUP.md](../MONGODB_SETUP.md) file in the project root.

## Development Workflow

The development workflow for the Dataset Publishing Platform follows these steps:

1. **Feature Planning**: Features are planned based on the SRS document and prioritized in the backlog.
2. **Development**: Features are implemented according to the architecture and design guidelines.
3. **Testing**: Features are tested using unit tests, integration tests, and end-to-end tests.
4. **Code Review**: Code is reviewed by team members to ensure quality and adherence to standards.
5. **Deployment**: Code is deployed to the staging environment for final testing before production.
6. **Release**: Features are released to production after approval.

## Contributing

For information on how to contribute to the project, please refer to the [CONTRIBUTING.md](../CONTRIBUTING.md) file in the project root.

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## Features

### Core Features

- **Dataset Upload and Processing**: Upload CSV and Excel files, validate contents, and extract metadata
  - Drag-and-drop file upload interface
  - Automatic validation of file structure and content
  - Extraction of key metadata (row count, column names, etc.)
  - **Interactive data preview** with sample rows from the dataset

## Component Documentation

### Upload Components

- [File Upload Component](./components/upload/file-upload.md): Drag-and-drop interface for file uploads
- [File Validation Component](./components/upload/file-validation.md): Validates uploaded file contents

### Preview Components

- [File Preview Component](./components/preview/file-preview.md): Displays file metadata and statistics
- [Data Table Preview Component](./components/preview/data-table-preview.md): Shows a sample of the actual data rows 