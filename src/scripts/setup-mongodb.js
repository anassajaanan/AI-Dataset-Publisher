/**
 * MongoDB Setup Script
 * 
 * This script helps set up the MongoDB collections for the dataset publishing platform.
 * It creates the necessary collections if they don't exist.
 * 
 * Usage:
 * 1. Update the .env.local file with your MongoDB connection string
 * 2. Run this script with: node src/scripts/setup-mongodb.js
 */

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

// Get the MongoDB URI from environment variables
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MongoDB URI is not defined in .env.local file');
  process.exit(1);
}

// Extract database name from the URI
const dbName = uri.split('/').pop().split('?')[0];

async function setupMongoDB() {
  console.log(`Setting up MongoDB for database: ${dbName}`);
  
  const client = new MongoClient(uri);
  
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Get the database
    const db = client.db(dbName);
    
    // Create collections if they don't exist
    const collections = ['datasets', 'datasetversions', 'datasetmetadata'];
    
    for (const collectionName of collections) {
      const collectionExists = await db.listCollections({ name: collectionName }).hasNext();
      
      if (!collectionExists) {
        await db.createCollection(collectionName);
        console.log(`Created collection: ${collectionName}`);
      } else {
        console.log(`Collection already exists: ${collectionName}`);
      }
    }
    
    console.log('\nMongoDB setup completed successfully!');
    console.log(`Database "${dbName}" is ready to use with the following collections:`);
    console.log('- datasets: Stores dataset information');
    console.log('- datasetversions: Stores version information for datasets');
    console.log('- datasetmetadata: Stores metadata for datasets');
    
  } catch (error) {
    console.error('Error setting up MongoDB:', error);
  } finally {
    await client.close();
  }
}

setupMongoDB().catch(console.error); 