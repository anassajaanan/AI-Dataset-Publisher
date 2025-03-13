# MongoDB Guide for Dataset Publishing Platform

This guide provides detailed information on how to use MongoDB with the Dataset Publishing Platform.

## Setting Up MongoDB

### 1. MongoDB Atlas Setup

If you don't already have a MongoDB Atlas account:

1. Sign up for a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a new cluster (the free tier is sufficient for development)
3. Set up database access:
   - Create a database user with read/write permissions
   - Remember the username and password
4. Set up network access:
   - Add your IP address to the IP access list
   - For development, you can allow access from anywhere (0.0.0.0/0)

### 2. Get Your Connection String

1. In MongoDB Atlas, click on "Connect" for your cluster
2. Select "Connect your application"
3. Copy the connection string
4. It will look like: `mongodb+srv://<username>:<password>@cluster0.w4xkbyu.mongodb.net/?retryWrites=true&w=majority`

### 3. Configure Your Application

1. Open the `.env.local` file in the root of your project
2. Update the `MONGODB_URI` with your connection string:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.w4xkbyu.mongodb.net/dataset-platform?retryWrites=true&w=majority
   ```
3. Replace `<username>` and `<password>` with your actual MongoDB credentials
4. Change `dataset-platform` to your preferred database name

### 4. Test Your Connection

We've provided a script to test your MongoDB connection:

```bash
node scripts/test-mongodb-connection.js
```

This script will:
- Connect to your MongoDB instance
- Verify that the connection is successful
- List any existing collections in your database
- Provide helpful error messages if the connection fails

### 5. Run the Setup Script

We've provided a setup script that will create the necessary collections in your MongoDB database:

```bash
node scripts/setup-mongodb.js
```

## Database Structure

The application uses the following collections:

### Datasets Collection

Stores basic information about uploaded datasets:

```javascript
{
  _id: ObjectId,
  filename: String,
  fileSize: Number,
  rowCount: Number,
  columns: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### DatasetVersions Collection

Stores version information for datasets:

```javascript
{
  _id: ObjectId,
  datasetId: ObjectId,
  versionNumber: Number,
  filePath: String,
  status: String, // 'draft', 'review', 'published', 'rejected'
  comments: String,
  createdAt: Date,
  updatedAt: Date
}
```

### DatasetMetadata Collection

Stores metadata for datasets:

```javascript
{
  _id: ObjectId,
  datasetId: ObjectId,
  title: String,
  description: String,
  keywords: [String],
  license: String,
  author: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Working with MongoDB in the Application

### Connection Management

The application uses a connection utility in `src/lib/db/mongodb.ts` that handles connection caching and reuse. This ensures efficient database connections and prevents connection leaks.

### Models

The application uses Mongoose models defined in `src/lib/db/models.ts` to interact with the database. These models provide a structured way to work with the data.

### Example Usage

Here's an example of how to use the models in your code:

```typescript
import connectToDatabase from '@/lib/db/mongodb';
import { Dataset, DatasetVersion, DatasetMetadata } from '@/lib/db/models';

// Connect to the database
await connectToDatabase();

// Create a new dataset
const dataset = new Dataset({
  filename: 'example.csv',
  fileSize: 1024,
  rowCount: 100,
  columns: ['id', 'name', 'age'],
});

await dataset.save();

// Create a new version
const version = new DatasetVersion({
  datasetId: dataset._id,
  versionNumber: 1,
  filePath: '/uploads/example.csv',
  status: 'draft',
});

await version.save();

// Create metadata
const metadata = new DatasetMetadata({
  datasetId: dataset._id,
  title: 'Example Dataset',
  description: 'This is an example dataset',
  keywords: ['example', 'test'],
  license: 'MIT',
  author: 'John Doe',
});

await metadata.save();

// Find a dataset by ID
const foundDataset = await Dataset.findById(dataset._id);

// Find all versions for a dataset
const versions = await DatasetVersion.find({ datasetId: dataset._id });

// Find the latest metadata for a dataset
const latestMetadata = await DatasetMetadata.findOne({ datasetId: dataset._id }).sort({ createdAt: -1 });
```

## Troubleshooting

### Connection Issues

If you encounter connection issues:

1. Check your MongoDB Atlas dashboard to ensure your cluster is running
2. Verify that your IP address is whitelisted in MongoDB Atlas
3. Check that your username and password are correct in the connection string
4. Ensure that the connection string format is correct

### Database Creation

MongoDB will automatically create the database when you first insert data. If you don't see the database:

1. Try uploading a file through the application
2. Check the console for any error messages
3. Run the setup script to create the collections

### Collection Issues

If collections aren't being created:

1. Check the console for error messages
2. Ensure your MongoDB user has the necessary permissions to create collections
3. Try running the setup script manually

## MongoDB Compass

MongoDB Compass is a graphical user interface for MongoDB that allows you to explore your data visually. It's a great tool for debugging and understanding your data structure.

1. Download MongoDB Compass from [here](https://www.mongodb.com/products/compass)
2. Connect to your MongoDB Atlas cluster using your connection string
3. Explore your database and collections

## Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Compass Documentation](https://docs.mongodb.com/compass/current/) 