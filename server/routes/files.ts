import { RequestHandler } from "express";
import multer from "multer";
import { FileStorageService, FileMetadata } from "../lib/file-storage";
import { authenticateToken } from "./auth";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Validation schema
const getFilesSchema = z.object({
  projectId: z.string().optional(),
});

export const handleUploadFile: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    const projectId = req.body.projectId ? parseInt(req.body.projectId) : undefined;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const metadata = await FileStorageService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      userId,
      projectId
    );

    res.status(201).json({ file: metadata });
  } catch (error) {
    console.error('Error uploading file:', error);
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export const handleGetFiles: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    const validation = getFilesSchema.safeParse(req.query);
    
    if (!validation.success) {
      return res.status(400).json({ message: 'Invalid query parameters' });
    }

    const { projectId } = validation.data;
    const projectIdNumber = projectId ? parseInt(projectId) : undefined;

    const files = FileStorageService.getUserFiles(userId, projectIdNumber);
    res.json({ files });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const handleGetFile: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    const fileId = req.params.id;

    const fileData = await FileStorageService.getFile(fileId);
    if (!fileData) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user owns the file
    if (fileData.metadata.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', fileData.metadata.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${fileData.metadata.originalName}"`);
    res.setHeader('Content-Length', fileData.metadata.size);

    res.send(fileData.buffer);
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const handleDeleteFile: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    const fileId = req.params.id;

    const success = await FileStorageService.deleteFile(fileId, userId);
    if (!success) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const handleGetProjectFiles: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    const projectId = parseInt(req.params.projectId);

    if (isNaN(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const files = FileStorageService.getProjectFiles(projectId, userId);
    res.json({ files });
  } catch (error) {
    console.error('Error fetching project files:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Export multer middleware
export { upload };
