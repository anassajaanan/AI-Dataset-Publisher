import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

// Base directory for file storage
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure the upload directory exists
async function ensureUploadDir(datasetId: string, version?: string): Promise<string> {
  // Create the base uploads directory if it doesn't exist
  if (!fs.existsSync(UPLOAD_DIR)) {
    await fsPromises.mkdir(UPLOAD_DIR, { recursive: true });
  }
  
  // Create a directory for this specific dataset
  const datasetDir = path.join(UPLOAD_DIR, datasetId);
  if (!fs.existsSync(datasetDir)) {
    await fsPromises.mkdir(datasetDir, { recursive: true });
  }
  
  // If a version is specified, create a subdirectory for it
  if (version) {
    const versionDir = path.join(datasetDir, `v${version}`);
    if (!fs.existsSync(versionDir)) {
      await fsPromises.mkdir(versionDir, { recursive: true });
    }
    return versionDir;
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
 * @param version Optional version identifier
 * @returns The path where the file was saved
 */
export async function saveFile(file: File, datasetId: string, version?: string): Promise<string> {
  try {
    // Ensure the directory exists
    const targetDir = await ensureUploadDir(datasetId, version);
    
    // Create a safe filename
    const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = path.join(targetDir, filename);
    
    // Log file information for debugging
    console.log('Saving file:', {
      originalName: file.name,
      safeFilename: filename,
      size: file.size,
      type: file.type,
      targetDir,
      filePath,
      version: version || 'default'
    });
    
    // Convert the file to an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Check if arrayBuffer is valid
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new FileStorageError('File content is empty or could not be read');
    }
    
    const buffer = Buffer.from(arrayBuffer);
    
    // Write the file to disk
    await fsPromises.writeFile(filePath, buffer);
    
    // Verify the file was written successfully
    const stats = await fsPromises.stat(filePath);
    console.log('File saved successfully:', {
      path: filePath,
      size: stats.size,
      version: version || 'default'
    });
    
    // Return the relative path (for storage in the database)
    return version 
      ? path.join('uploads', datasetId, `v${version}`, filename)
      : path.join('uploads', datasetId, filename);
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
    // Create a new ArrayBuffer from the buffer to ensure type compatibility
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; i++) {
      view[i] = buffer[i];
    }
    return arrayBuffer;
  } catch (error) {
    console.error('Error getting file array buffer:', error);
    throw new FileStorageError(`Failed to get file array buffer: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 