# Dataset Publishing Platform

A modern web application for uploading, processing, and publishing research datasets with AI-powered metadata generation.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Project Overview

The Dataset Publishing Platform is designed to streamline the process of publishing research datasets. It provides a user-friendly interface for uploading datasets, automatically generates metadata using AI, and implements a structured workflow for review and publication.

### Key Features

- **Dataset Upload**: Drag-and-drop interface for uploading CSV and Excel files
- **Automatic Processing**: Extract file statistics, column information, and data samples
- **AI-Powered Metadata Generation**: Automatically generate descriptive metadata for datasets
- **Bilingual Support**: Generate metadata in both English and Arabic
- **Publishing Workflow**: Multi-step process for review and publication
- **Version Control**: Track changes to datasets over time
- **Dashboard**: Monitor dataset status and manage the publication process

### Current Implementation Status

The project is currently in active development. For a detailed breakdown of implemented features and next steps, see the [TRACKER.md](./TRACKER.md) file.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                  # Next.js app router pages
│   ├── api/              # API routes
│   ├── datasets/         # Dataset listing and detail pages
│   ├── dashboard/        # Dashboard pages
│   ├── upload/           # Upload page
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── ui/               # UI components (buttons, cards, etc.)
│   ├── preview/          # Data preview components
│   ├── metadata/         # Metadata editing components
│   ├── dashboard/        # Dashboard components
│   └── upload/           # Upload components
├── lib/                  # Utility functions and services
│   ├── db/               # Database models and connection
│   ├── services/         # Business logic services
│   │   ├── ai/           # AI services for metadata generation
│   │   └── storage/      # File storage services
│   └── utils.ts          # Utility functions
└── types/                # TypeScript type definitions
```

## File Storage Implementation

The platform uses a local file system storage approach for storing uploaded dataset files:

### Storage Structure

- Files are stored in the `uploads` directory at the project root
- Each dataset has its own subdirectory named with the dataset ID
- Original filenames are preserved (with sanitization for security)
- File paths are stored in the database for reference

### Setup

The uploads directory is automatically created when you run:

```bash
npm run setup-uploads
```

This script is also run automatically during `npm install` via the postinstall hook.

### Implementation Details

- **File Upload**: Files are uploaded via the `/api/upload` endpoint and saved to the file system
- **File Retrieval**: Files are retrieved for preview and metadata generation
- **AI Processing**: File content is read and provided to the AI service for metadata generation
- **Error Handling**: Robust error handling for file operations with fallbacks

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## MongoDB Setup

This application uses MongoDB for data storage. Follow these steps to set up your MongoDB connection:

### 1. Update your MongoDB Connection String

1. Open the `.env.local` file in the root of your project
2. Update the `MONGODB_URI` with your MongoDB connection string:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.w4xkbyu.mongodb.net/dataset-platform?retryWrites=true&w=majority
```

**Important Notes:**
- Replace `<username>` and `<password>` with your actual MongoDB credentials
- Change `dataset-platform` to your preferred database name
- MongoDB will automatically create the database when you first insert data
- Keep the `?retryWrites=true&w=majority` parameters as they ensure data consistency

### 2. Test Your Connection

We've provided a script to test your MongoDB connection:

```bash
node scripts/test-mongodb-connection.js
```

This script will verify that your connection string is correct and list any existing collections.

### 3. Run the Setup Script (Optional)

We've provided a setup script that will create the necessary collections in your MongoDB database:

```bash
node scripts/setup-mongodb.js
```

This script will:
- Connect to your MongoDB instance
- Create the database if it doesn't exist
- Create the required collections

### 4. Database Structure

The application automatically creates the following collections:

- `datasets`: Stores basic information about uploaded datasets
- `datasetversions`: Stores version information for datasets
- `datasetmetadata`: Stores metadata for datasets

### 5. Troubleshooting

If you encounter connection issues:
- Ensure your IP address is whitelisted in MongoDB Atlas
- Check that your username and password are correct
- Verify that the connection string format is correct

## Contributing

Please see the [TRACKER.md](./TRACKER.md) file for information on current implementation status and next steps.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
