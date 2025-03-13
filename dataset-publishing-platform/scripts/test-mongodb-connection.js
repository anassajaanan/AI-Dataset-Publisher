/**
 * MongoDB Connection Test Script
 * 
 * This script tests the connection to your MongoDB database.
 * It's a simple way to verify that your connection string is correct.
 * 
 * Usage:
 * 1. Update the .env.local file with your MongoDB connection string
 * 2. Run this script with: node scripts/test-mongodb-connection.js
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

async function testConnection() {
  console.log('Testing connection to MongoDB...');
  console.log(`Database name: ${dbName}`);
  
  const client = new MongoClient(uri);
  
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    // Get the database
    const db = client.db(dbName);
    
    // List collections
    const collections = await db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('No collections found in the database.');
      console.log('This is normal if you haven\'t created any collections yet.');
      console.log('Run the setup script to create the necessary collections:');
      console.log('  node scripts/setup-mongodb.js');
    } else {
      console.log(`Found ${collections.length} collections in the database:`);
      collections.forEach((collection, index) => {
        console.log(`  ${index + 1}. ${collection.name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:');
    console.error(error);
    
    // Provide more helpful error messages based on common issues
    if (error.code === 'ENOTFOUND') {
      console.error('\nThe hostname could not be found. Check your connection string.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\nConnection timed out. Check your network connection and firewall settings.');
    } else if (error.message.includes('Authentication failed')) {
      console.error('\nAuthentication failed. Check your username and password in the connection string.');
    } else if (error.message.includes('not authorized')) {
      console.error('\nNot authorized. Check that your user has the necessary permissions.');
    }
    
    process.exit(1);
  } finally {
    await client.close();
  }
}

testConnection().catch(console.error); ✓ Starting...
✓ Ready in 1528ms
○ Compiling /upload ...
✓ Compiled /upload in 1130ms (963 modules)
GET /upload 200 in 1350ms
✓ Compiled /favicon.ico in 285ms (587 modules)
GET /favicon.ico 200 in 592ms
✓ Compiled /api/upload in 382ms (990 modules)
Upload API called
GET /upload 200 in 367ms
GET /favicon.ico 200 in 212ms
Connected to MongoDB successfully
Form data parsed successfully
Received file: test-simple.csv Type: text/csv Size: 53
File content size (bytes): 53
File content preview: Name,Age,City
John,30,New York
Jane,25,San Francisco

Created processable file: 53
Processing file...
Processing file: test-simple.csv Type: text/csv Size: 53
File content size in processFile (bytes): 53
CSV content preview: Name,Age,City
John,30,New York
Jane,25,San Francisco

File extension: csv
Processing CSV file...
File processing error: ReferenceError: FileReader is not defined
   at eval (src/lib/services/fileProcessingService.ts:87:19)
   at new Promise (<anonymous>)
   at processCSV (src/lib/services/fileProcessingService.ts:83:9)
   at processFile (src/lib/services/fileProcessingService.ts:66:19)
   at async POST (src/app/api/upload/route.ts:124:18)
 85 |     
 86 |     // First, check if we can read the file content
> 87 |     const reader = new FileReader();
    |                   ^
 88 |     
 89 |     reader.onload = (e) => {
 90 |       let content = e.target?.result as string;
Error processing file: Error [FileProcessingError]: Failed to process file. Please try again.
   at <unknown> (FileProcessingError: Failed to process file. Please try again.)
   at processFile (src/lib/services/fileProcessingService.ts:78:10)
   at async POST (src/app/api/upload/route.ts:124:18)
 76 |       throw error;
 77 |     }
> 78 |     throw new FileProcessingError('Failed to process file. Please try again.');
    |          ^
 79 |   }
 80 | }
 81 |
POST /api/upload 400 in 2836ms