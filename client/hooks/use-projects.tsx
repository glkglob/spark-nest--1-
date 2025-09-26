/**
 * Projects Service Hook
 * Provides project management functionality with authentication
 */

import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from './use-auth';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  progress: number;
  team: string[];
  materials: Material[];
  files: File[];
  createdAt: string;
  updatedAt: string;
}

export interface Material {
  id: string;
  name: string;
  type: string;
  quantity: number;
  unit: string;
  cost: number;
  supplier: string;
  status: 'ordered' | 'delivered' | 'used' | 'returned';
  deliveryDate?: string;
  projectId: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  projectId: string;
}

export function useProjects() {
  const { user, token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch projects');
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createProject = useCallback(async (projectData: Partial<Project>) => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const newProject = await api.createProject(projectData);
      setProjects(prev => [...prev, newProject]);
      return newProject;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create project');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const updateProject = useCallback(async (id: string, projectData: Partial<Project>) => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedProject = await api.updateProject(id, projectData);
      setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
      return updatedProject;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to update project');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const deleteProject = useCallback(async (id: string) => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      await api.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to delete project');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const getProject = useCallback(async (id: string) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      const all = await api.getProjects();
      return all.find((p: any) => p.id === id) || null;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch project');
      }
      throw err;
    }
  }, [token]);

  // Materials management
  const getMaterials = useCallback(async (projectId: string) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      return await api.getMaterials(projectId);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch materials');
      }
      throw err;
    }
  }, [token]);

  const createMaterial = useCallback(async (projectId: string, materialData: Partial<Material>) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      return await api.createMaterial(projectId, materialData);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create material');
      }
      throw err;
    }
  }, [token]);

  const updateMaterial = useCallback(async (materialId: string, materialData: Partial<Material>) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      return await api.updateMaterial(materialId, materialData);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to update material');
      }
      throw err;
    }
  }, [token]);

  const deleteMaterial = useCallback(async (materialId: string) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      await api.deleteMaterial(materialId);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to delete material');
      }
      throw err;
    }
  }, [token]);

  // File management
  const uploadFile = useCallback(async (file: File, projectId?: string) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      return await api.uploadFile(file, projectId);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to upload file');
      }
      throw err;
    }
  }, [token]);

  const getProjectFiles = useCallback(async (projectId: string) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      return await api.getProjectFiles(projectId);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch project files');
      }
      throw err;
    }
  }, [token]);

  const deleteFile = useCallback(async (fileId: string) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      await api.deleteFile(fileId);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to delete file');
      }
      throw err;
    }
  }, [token]);

  // Load projects on mount
  useEffect(() => {
    if (user && token) {
      fetchProjects();
    }
  }, [user, token, fetchProjects]);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    getProject,
    getMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    uploadFile,
    getProjectFiles,
    deleteFile,
  };
}
