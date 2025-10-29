import { Readable } from 'stream';
import { promises as fs, createReadStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Local file system storage for uploaded images
// Images are stored in public/uploads directory to be served by Express
const UPLOADS_BASE_DIR = './public/uploads';

// Ensure uploads directory exists on initialization
function ensureUploadsDir() {
  if (!existsSync(UPLOADS_BASE_DIR)) {
    mkdirSync(UPLOADS_BASE_DIR, { recursive: true });
    console.log(`[AppStorage] Created uploads directory: ${UPLOADS_BASE_DIR}`);
  }
  
  // Ensure subdirectories exist
  const subdirs = ['covers', 'chapters'];
  subdirs.forEach(dir => {
    const dirPath = join(UPLOADS_BASE_DIR, dir);
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
      console.log(`[AppStorage] Created subdirectory: ${dirPath}`);
    }
  });
}

// Initialize on module load
ensureUploadsDir();

export async function uploadImage(
  buffer: Buffer,
  filename: string,
  folder: 'covers' | 'chapters'
): Promise<string> {
  try {
    const key = `${folder}/${filename}`;
    const filePath = join(UPLOADS_BASE_DIR, key);
    
    console.log(`[AppStorage] Uploading image to: ${filePath}`);
    
    // Ensure folder exists
    const folderPath = join(UPLOADS_BASE_DIR, folder);
    if (!existsSync(folderPath)) {
      await fs.mkdir(folderPath, { recursive: true });
    }
    
    // Write file to disk
    await fs.writeFile(filePath, buffer);
    
    console.log(`[AppStorage] Successfully uploaded: ${key}`);
    return key;
  } catch (error) {
    console.error(`[AppStorage] Error uploading image ${filename}:`, error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getImageStream(filename: string): Promise<Readable> {
  try {
    console.log(`[AppStorage] Retrieving image: ${filename}`);
    
    const filePath = join(UPLOADS_BASE_DIR, filename);
    
    // Check if file exists
    if (!existsSync(filePath)) {
      throw new Error(`Image not found: ${filename}`);
    }
    
    const stream = createReadStream(filePath);
    
    console.log(`[AppStorage] Successfully retrieved stream for: ${filename}`);
    return stream;
  } catch (error) {
    console.error(`[AppStorage] Error retrieving image ${filename}:`, error);
    throw new Error(`Failed to retrieve image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getImageBytes(filename: string): Promise<Buffer> {
  try {
    console.log(`[AppStorage] Retrieving image bytes: ${filename}`);
    
    const filePath = join(UPLOADS_BASE_DIR, filename);
    
    // Check if file exists
    if (!existsSync(filePath)) {
      throw new Error(`Image not found: ${filename}`);
    }
    
    const buffer = await fs.readFile(filePath);
    
    console.log(`[AppStorage] Successfully retrieved ${buffer.length} bytes for: ${filename}`);
    return buffer;
  } catch (error) {
    console.error(`[AppStorage] Error retrieving image bytes ${filename}:`, error);
    throw new Error(`Failed to retrieve image bytes: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteImage(filename: string): Promise<void> {
  try {
    console.log(`[AppStorage] Deleting image: ${filename}`);
    
    const filePath = join(UPLOADS_BASE_DIR, filename);
    
    // Check if file exists before deleting
    if (existsSync(filePath)) {
      await fs.unlink(filePath);
      console.log(`[AppStorage] Successfully deleted: ${filename}`);
    } else {
      console.log(`[AppStorage] Image not found (already deleted?): ${filename}`);
    }
  } catch (error) {
    console.error(`[AppStorage] Error deleting image ${filename}:`, error);
    throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function listImages(prefix: string): Promise<string[]> {
  try {
    console.log(`[AppStorage] Listing images with prefix: ${prefix}`);
    
    const dirPath = join(UPLOADS_BASE_DIR, prefix);
    
    // Check if directory exists
    if (!existsSync(dirPath)) {
      console.log(`[AppStorage] Directory not found: ${prefix}, returning empty list`);
      return [];
    }
    
    const files = await fs.readdir(dirPath);
    
    // Return full keys (prefix + filename)
    const keys = files.map(file => `${prefix}/${file}`);
    
    console.log(`[AppStorage] Found ${keys.length} images with prefix: ${prefix}`);
    return keys;
  } catch (error) {
    console.error(`[AppStorage] Error listing images with prefix ${prefix}:`, error);
    throw new Error(`Failed to list images: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
