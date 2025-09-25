import { RequestHandler } from "express";
import { z } from "zod";
import { ProjectsService } from "../lib/projects-service";
import { authenticateToken } from "./auth";

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  budget: z.number().positive("Budget must be positive"),
  client: z.string().optional(),
  location: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  contractor: z.string().optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(['active', 'planning', 'completed']).optional(),
  progress: z.number().min(0).max(100).optional(),
  budget: z.number().positive().optional(),
  spent: z.number().min(0).optional(),
  cpi: z.number().positive().optional(),
  spi: z.number().positive().optional(),
  quality_score: z.number().min(0).max(100).optional(),
  safety_score: z.number().min(0).max(100).optional(),
  acceptance_criteria_complete: z.number().min(0).max(100).optional(),
  risk_level: z.enum(['low', 'medium', 'high']).optional(),
  client: z.string().optional(),
  location: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  team_size: z.number().positive().optional(),
  contractor: z.string().optional(),
});

const createMaterialSchema = z.object({
  name: z.string().min(1, "Material name is required"),
  current_stock: z.number().min(0, "Current stock must be non-negative"),
  total_required: z.number().positive("Total required must be positive"),
  cost: z.number().positive("Cost must be positive"),
  supplier: z.string().min(1, "Supplier is required"),
});

const updateMaterialSchema = z.object({
  name: z.string().min(1).optional(),
  current_stock: z.number().min(0).optional(),
  total_required: z.number().positive().optional(),
  status: z.enum(['adequate', 'low', 'critical']).optional(),
  cost: z.number().positive().optional(),
  supplier: z.string().min(1).optional(),
});

// Project routes
export const handleGetProjects: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    const projects = await ProjectsService.getUserProjects(userId);
    res.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const handleGetProject: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    const projectId = parseInt(req.params.id);
    
    if (isNaN(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const project = await ProjectsService.getProjectById(projectId, userId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ project });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const handleCreateProject: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    const validation = createProjectSchema.safeParse(req.body);
    
    if (!validation.success) {
      const errors = validation.error.issues.map(err => ({
        message: err.message,
        field: err.path[0] as string,
      }));
      return res.status(400).json({ errors });
    }

    const projectData = validation.data;
    const project = await ProjectsService.createProject(projectData, userId);
    
    if (!project) {
      return res.status(500).json({ message: 'Failed to create project' });
    }

    // Send notification
    const notificationService = req.app.locals.notificationService;
    if (notificationService) {
      notificationService.notifyProjectCreated(userId, project.name, project.id);
    }

    res.status(201).json({ project });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const handleUpdateProject: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    const projectId = parseInt(req.params.id);
    
    if (isNaN(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const validation = updateProjectSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.issues.map(err => ({
        message: err.message,
        field: err.path[0] as string,
      }));
      return res.status(400).json({ errors });
    }

    const updates = validation.data;
    const project = await ProjectsService.updateProject(projectId, updates, userId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ project });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const handleDeleteProject: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    const projectId = parseInt(req.params.id);
    
    if (isNaN(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const success = await ProjectsService.deleteProject(projectId, userId);
    if (!success) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Material routes
export const handleGetMaterials: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    const projectId = parseInt(req.params.projectId);
    
    if (isNaN(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const materials = await ProjectsService.getProjectMaterials(projectId, userId);
    res.json({ materials });
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const handleCreateMaterial: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    const projectId = parseInt(req.params.projectId);
    
    if (isNaN(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const validation = createMaterialSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.issues.map(err => ({
        message: err.message,
        field: err.path[0] as string,
      }));
      return res.status(400).json({ errors });
    }

    const materialData = validation.data;
    const material = await ProjectsService.createMaterial(materialData, projectId, userId);
    
    if (!material) {
      return res.status(500).json({ message: 'Failed to create material' });
    }

    res.status(201).json({ material });
  } catch (error) {
    console.error('Error creating material:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const handleUpdateMaterial: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    const materialId = parseInt(req.params.materialId);
    
    if (isNaN(materialId)) {
      return res.status(400).json({ message: 'Invalid material ID' });
    }

    const validation = updateMaterialSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.issues.map(err => ({
        message: err.message,
        field: err.path[0] as string,
      }));
      return res.status(400).json({ errors });
    }

    const updates = validation.data;
    const material = await ProjectsService.updateMaterial(materialId, updates, userId);
    
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    res.json({ material });
  } catch (error) {
    console.error('Error updating material:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const handleDeleteMaterial: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    const materialId = parseInt(req.params.materialId);
    
    if (isNaN(materialId)) {
      return res.status(400).json({ message: 'Invalid material ID' });
    }

    const success = await ProjectsService.deleteMaterial(materialId, userId);
    if (!success) {
      return res.status(404).json({ message: 'Material not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

