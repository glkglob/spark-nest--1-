// Simple file storage implementation
// In production, you'd use cloud storage like AWS S3, Google Cloud Storage, or Supabase Storage

import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export interface FileMetadata {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  userId: string;
  projectId?: number;
  uploadedAt: string;
  url: string;
}

export class FileStorageService {
  private static uploadDir = process.env.UPLOAD_DIR || './uploads';
  private static maxFileSize = 10 * 1024 * 1024; // 10MB
  private static allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed'
  ];

  private static files: Map<string, FileMetadata> = new Map();

  static async initialize() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      console.log('File storage initialized');
    } catch (error) {
      console.error('Error initializing file storage:', error);
    }
  }

  static async uploadFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    userId: string,
    projectId?: number
  ): Promise<FileMetadata> {
    // Validate file
    if (buffer.length > this.maxFileSize) {
      throw new Error('File too large. Maximum size is 10MB.');
    }

    if (!this.allowedMimeTypes.includes(mimeType)) {
      throw new Error('File type not allowed.');
    }

    // Generate unique filename
    const fileId = uuidv4();
    const extension = path.extname(originalName);
    const fileName = `${fileId}${extension}`;
    const filePath = path.join(this.uploadDir, fileName);

    // Save file
    await fs.writeFile(filePath, buffer);

    // Create metadata
    const metadata: FileMetadata = {
      id: fileId,
      originalName,
      fileName,
      mimeType,
      size: buffer.length,
      userId,
      projectId,
      uploadedAt: new Date().toISOString(),
      url: `/api/files/${fileId}`,
    };

    // Store metadata
    this.files.set(fileId, metadata);

    return metadata;
  }

  static async getFile(fileId: string): Promise<{ buffer: Buffer; metadata: FileMetadata } | null> {
    const metadata = this.files.get(fileId);
    if (!metadata) {
      return null;
    }

    const filePath = path.join(this.uploadDir, metadata.fileName);
    
    try {
      const buffer = await fs.readFile(filePath);
      return { buffer, metadata };
    } catch (error) {
      console.error('Error reading file:', error);
      return null;
    }
  }

  static async deleteFile(fileId: string, userId: string): Promise<boolean> {
    const metadata = this.files.get(fileId);
    if (!metadata || metadata.userId !== userId) {
      return false;
    }

    try {
      const filePath = path.join(this.uploadDir, metadata.fileName);
      await fs.unlink(filePath);
      this.files.delete(fileId);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  static getUserFiles(userId: string, projectId?: number): FileMetadata[] {
    const files = Array.from(this.files.values());
    
    let filteredFiles = files.filter(file => file.userId === userId);
    
    if (projectId !== undefined) {
      filteredFiles = filteredFiles.filter(file => file.projectId === projectId);
    }

    return filteredFiles.sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  static getProjectFiles(projectId: number, userId: string): FileMetadata[] {
    return this.getUserFiles(userId, projectId);
  }
}
