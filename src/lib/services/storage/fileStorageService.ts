import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

// Base directory for file storage
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure the upload directory exists
async function ensureUploadDir(datasetId: string): Promise<string> {
  // Create the base uploads directory if it doesn't exist
  if (!fs.existsSync(UPLOAD_DIR)) {
    await fsPromises.mkdir(UPLOAD_DIR, { recursive: true });
  }
  
  // Create a directory for this specific dataset
  const datasetDir = path.join(UPLOAD_DIR, datasetId);
  if (!fs.existsSync(datasetDir)) {
    await fsPromises.mkdir(datasetDir, { recursive: true });
  }
  
  return datasetDir;
}

export class FileStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileStorageError';
  }
}

/**
 * Saves a file to the local file system
 * @param file The file to save
 * @param datasetId The ID of the dataset the file belongs to
 * @returns The path where the file was saved
 */
export async function saveFile(file: File, datasetId: string): Promise<string> {
  try {
    // Ensure the directory exists
    const datasetDir = await ensureUploadDir(datasetId);
    
    // Create a safe filename
    const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = path.join(datasetDir, filename);
    
    // Convert the file to an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Write the file to disk
    await fsPromises.writeFile(filePath, buffer);
    
    // Return the relative path (for storage in the database)
    return path.join('uploads', datasetId, filename);
  } catch (error) {
    console.error('Error saving file:', error);
    throw new FileStorageError(`Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Reads a file from the local file system
 * @param filePath The path to the file (relative to the project root)
 * @returns The file content as a Buffer
 */
export async function readFile(filePath: string): Promise<Buffer> {
  try {
    // Convert relative path to absolute path
    const absolutePath = path.join(process.cwd(), filePath);
    
    // Check if the file exists
    if (!fs.existsSync(absolutePath)) {
      throw new FileStorageError(`File not found: ${filePath}`);
    }
    
    // Read the file
    return await fsPromises.readFile(absolutePath);
  } catch (error) {
    console.error('Error reading file:', error);
    throw new FileStorageError(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Deletes a file from the local file system
 * @param filePath The path to the file (relative to the project root)
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    // Convert relative path to absolute path
    const absolutePath = path.join(process.cwd(), filePath);
    
    // Check if the file exists
    if (!fs.existsSync(absolutePath)) {
      throw new FileStorageError(`File not found: ${filePath}`);
    }
    
    // Delete the file
    await fsPromises.unlink(absolutePath);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new FileStorageError(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets the file content as a string (for text files like CSV)
 * @param filePath The path to the file (relative to the project root)
 * @returns The file content as a string
 */
export async function getFileContent(filePath: string): Promise<string> {
  try {
    const buffer = await readFile(filePath);
    return buffer.toString('utf-8');
  } catch (error) {
    console.error('Error getting file content:', error);
    throw new FileStorageError(`Failed to get file content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets the file content as an ArrayBuffer
 * @param filePath The path to the file (relative to the project root)
 * @returns The file content as an ArrayBuffer
 */
export async function getFileArrayBuffer(filePath: string): Promise<ArrayBuffer> {
  try {
    const buffer = await readFile(filePath);
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  } catch (error) {
    console.error('Error getting file array buffer:', error);
    throw new FileStorageError(`Failed to get file array buffer: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 