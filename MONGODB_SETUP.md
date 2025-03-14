# MongoDB Setup for Dataset Publishing Platform

This guide will help you set up MongoDB for the Dataset Publishing Platform.

## Prerequisites

- A MongoDB Atlas account (or any MongoDB instance)
- Node.js installed on your machine

## Setup Instructions

### 1. Update your MongoDB Connection String

1. Open the `.env.local` file in the root of your project
2. Update the `MONGODB_URI` with your MongoDB connection string:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.w4xkbyu.mongodb.net/dataset-platform?retryWrites=true&w=majority
```

**Important Notes:**
- Replace `<username>` and `<password>` with your actual MongoDB credentials
- The database name `dataset-platform` in the connection string will be created automatically
- Keep the `?retryWrites=true&w=majority` parameters as they ensure data consistency

### 2. Install Dependencies

Make sure you have the required dependencies installed:

```bash
npm install mongodb mongoose dotenv
```

### 3. Run the Setup Script

We've provided a setup script that will create the necessary collections in your MongoDB database:

```bash
node scripts/setup-mongodb.js
```

This script will:
- Connect to your MongoDB instance
- Create the database if it doesn't exist
- Create the required collections:
  - `datasets`: Stores dataset information
  - `datasetversions`: Stores version information for datasets
  - `datasetmetadata`: Stores metadata for datasets

### 4. Verify the Setup

You can verify the setup by checking your MongoDB Atlas dashboard or by using MongoDB Compass to connect to your database.

## Database Structure

The application uses the following collections:

### Datasets Collection
Stores basic information about uploaded datasets:
- `_id`: Unique identifier
- `filename`: Original filename
- `fileSize`: Size in bytes
- `rowCount`: Number of rows in the dataset
- `columns`: Array of column names
- `createdAt`: Timestamp when the dataset was created
- `updatedAt`: Timestamp when the dataset was last updated

### DatasetVersions Collection
Stores version information for datasets:
- `_id`: Unique identifier
- `datasetId`: Reference to the dataset
- `versionNumber`: Version number (1, 2, 3, etc.)
- `filePath`: Path to the stored file
- `status`: Status of the version (draft, review, published, rejected)
- `comments`: Optional comments about the version
- `createdAt`: Timestamp when the version was created
- `updatedAt`: Timestamp when the version was last updated

### DatasetMetadata Collection
Stores metadata for datasets:
- `_id`: Unique identifier
- `datasetId`: Reference to the dataset
- `title`: Title of the dataset
- `description`: Description of the dataset
- `keywords`: Array of keywords
- `license`: License information
- `author`: Author of the dataset
- `createdAt`: Timestamp when the metadata was created
- `updatedAt`: Timestamp when the metadata was last updated

## Troubleshooting

### Connection Issues
- Ensure your IP address is whitelisted in MongoDB Atlas
- Check that your username and password are correct
- Verify that the connection string format is correct

### Database Creation
- MongoDB will automatically create the database when you first insert data
- If you don't see the database, try uploading a file through the application

### Collection Issues
- If collections aren't being created, check the console for error messages
- Ensure your MongoDB user has the necessary permissions to create collections 