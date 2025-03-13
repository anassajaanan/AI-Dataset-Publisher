# Dataset Publishing Platform - Documentation Index

Welcome to the Dataset Publishing Platform documentation. This index provides an overview of all available documentation files and serves as a central navigation point.

## Documentation Files

### Core Documentation

- [**README.md**](./README.md) - Comprehensive overview of the project, features, architecture, and implementation details
- [**API.md**](./API.md) - Detailed documentation of all API endpoints, request/response formats, and error handling
- [**Components.md**](./Components.md) - Documentation of React components, their props, state management, and usage examples
- [**Database.md**](./Database.md) - Database schema, models, relationships, and data access patterns
- [**Workflow.md**](./Workflow.md) - Complete workflow and user journey from dataset upload to publication
- [**SubmitAPI.md**](./SubmitAPI.md) - Detailed documentation of the dataset submission API endpoint

## Quick Start

To get started with the Dataset Publishing Platform:

1. **Setup the Environment**
   ```bash
   # Clone the repository
   git clone <repository-url>
   cd dataset-publishing-platform

   # Install dependencies
   npm install

   # Setup the database
   npx prisma migrate dev

   # Start the development server
   npm run dev
   ```

2. **Access the Application**
   - Open your browser and navigate to `http://localhost:3000`
   - The dashboard will be available at `http://localhost:3000/dashboard`
   - The upload page will be available at `http://localhost:3000/upload`

## Key Features

- **Dataset Upload and Processing**
  - CSV and Excel file support
  - Automatic extraction of file statistics
  - Version tracking

- **AI-Powered Metadata Generation**
  - Bilingual support (English/Arabic)
  - Customizable metadata fields
  - Tag management

- **Publishing Workflow**
  - Multi-step review process
  - Status tracking
  - Version history

## Architecture Overview

The Dataset Publishing Platform is built with:

- **Next.js 14** (App Router) for the frontend and API routes
- **TypeScript** for type safety
- **Prisma ORM** with **PostgreSQL** for data storage
- **Tailwind CSS** for styling
- **React** components for the UI

The application follows a modular architecture with:

- **Pages**: Next.js pages for routing
- **Components**: Reusable React components
- **API Routes**: Server-side endpoints
- **Services**: Business logic
- **Database**: Data storage and retrieval

## Development Guidelines

- Follow the established project structure
- Use TypeScript for all new code
- Write tests for new features
- Document API endpoints and components
- Follow the Git workflow described in the README

## Troubleshooting

Common issues and their solutions:

1. **Database Connection Issues**
   - Check your `.env` file for correct database URL
   - Ensure PostgreSQL is running

2. **API Errors**
   - Check the server logs for detailed error messages
   - Verify request formats against the API documentation

3. **UI Issues**
   - Clear browser cache
   - Check for JavaScript console errors

## Contributing

To contribute to the Dataset Publishing Platform:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests for your changes
5. Submit a pull request

## Contact

For questions or support, please contact the development team at:

- Email: [team@example.com](mailto:team@example.com)
- GitHub Issues: [Create a new issue](https://github.com/example/dataset-publishing-platform/issues) 