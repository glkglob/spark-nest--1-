// Fallback database implementation using in-memory storage
// This allows the app to work without Supabase configuration

import { User } from '@shared/api';

interface Project {
  id: number;
  name: string;
  status: 'active' | 'planning' | 'completed';
  progress: number;
  budget: number;
  spent: number;
  cpi: number;
  spi: number;
  quality_score: number;
  safety_score: number;
  acceptance_criteria_complete: number;
  risk_level: 'low' | 'medium' | 'high';
  client?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  team_size?: number;
  contractor?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  materials?: Material[];
}

interface Material {
  id: number;
  name: string;
  current_stock: number;
  total_required: number;
  status: 'adequate' | 'low' | 'critical';
  cost: number;
  supplier: string;
  project_id: number;
  created_at: string;
  updated_at: string;
}

// In-memory storage
const users: User[] = [
  {
    id: "1",
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
    avatar: "AU",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const projects: Project[] = [];
const materials: Material[] = [];

let nextProjectId = 1;
let nextMaterialId = 1;

export class FallbackDatabase {
  // Users
  static findUserByEmail(email: string): User | null {
    return users.find(u => u.email === email) || null;
  }

  static findUserById(id: string): User | null {
    return users.find(u => u.id === id) || null;
  }

  static createUser(userData: { email: string; name: string; password_hash: string }): User {
    const newUser: User = {
      id: String(users.length + 1),
      email: userData.email,
      name: userData.name,
      role: 'user',
      avatar: userData.name.split(' ').map(n => n[0]).join('').toUpperCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);
    return newUser;
  }

  static updateUser(id: string, updateData: { name?: string; avatar?: string; preferences?: any }): User | null {
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) return null;

    const user = users[userIndex];
    if (updateData.name) {
      user.name = updateData.name;
    }
    if (updateData.avatar) {
      user.avatar = updateData.avatar;
    }
    user.updatedAt = new Date().toISOString();

    return user;
  }

  // Projects
  static getUserProjects(userId: string): Project[] {
    return projects.filter(p => p.user_id === userId);
  }

  static getProjectById(id: number, userId: string): Project | null {
    const project = projects.find(p => p.id === id && p.user_id === userId);
    if (project) {
      project.materials = materials.filter(m => m.project_id === id);
    }
    return project || null;
  }

  static createProject(projectData: any, userId: string): Project {
    const newProject: Project = {
      id: nextProjectId++,
      name: projectData.name,
      status: 'planning',
      progress: 0,
      budget: projectData.budget,
      spent: 0,
      cpi: 1.0,
      spi: 1.0,
      quality_score: 0,
      safety_score: 0,
      acceptance_criteria_complete: 0,
      risk_level: 'low',
      client: projectData.client,
      location: projectData.location,
      start_date: projectData.start_date,
      end_date: projectData.end_date,
      contractor: projectData.contractor,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      materials: [],
    };
    projects.push(newProject);
    return newProject;
  }

  static updateProject(id: number, updates: any, userId: string): Project | null {
    const projectIndex = projects.findIndex(p => p.id === id && p.user_id === userId);
    if (projectIndex === -1) return null;

    projects[projectIndex] = {
      ...projects[projectIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    return projects[projectIndex];
  }

  static deleteProject(id: number, userId: string): boolean {
    const projectIndex = projects.findIndex(p => p.id === id && p.user_id === userId);
    if (projectIndex === -1) return false;

    // Also delete associated materials
    const materialIndices = materials
      .map((m, i) => m.project_id === id ? i : -1)
      .filter(i => i !== -1)
      .reverse();

    materialIndices.forEach(i => materials.splice(i, 1));
    projects.splice(projectIndex, 1);

    return true;
  }

  // Materials
  static getProjectMaterials(projectId: number, userId: string): Material[] {
    // Verify user owns the project
    const project = projects.find(p => p.id === projectId && p.user_id === userId);
    if (!project) return [];

    return materials.filter(m => m.project_id === projectId);
  }

  static createMaterial(materialData: any, projectId: number, userId: string): Material | null {
    // Verify user owns the project
    const project = projects.find(p => p.id === projectId && p.user_id === userId);
    if (!project) return null;

    const newMaterial: Material = {
      id: nextMaterialId++,
      name: materialData.name,
      current_stock: materialData.current_stock,
      total_required: materialData.total_required,
      status: materialData.current_stock / materialData.total_required < 0.1 ? 'critical' : 
              materialData.current_stock / materialData.total_required < 0.3 ? 'low' : 'adequate',
      cost: materialData.cost,
      supplier: materialData.supplier,
      project_id: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    materials.push(newMaterial);
    return newMaterial;
  }

  static updateMaterial(id: number, updates: any, userId: string): Material | null {
    const materialIndex = materials.findIndex(m => m.id === id);
    if (materialIndex === -1) return null;

    const material = materials[materialIndex];
    const project = projects.find(p => p.id === material.project_id && p.user_id === userId);
    if (!project) return null;

    materials[materialIndex] = {
      ...materials[materialIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Update status based on stock
    if (updates.current_stock !== undefined || updates.total_required !== undefined) {
      const currentStock = updates.current_stock ?? materials[materialIndex].current_stock;
      const totalRequired = updates.total_required ?? materials[materialIndex].total_required;
      
      materials[materialIndex].status = currentStock / totalRequired < 0.1 ? 'critical' : 
                                        currentStock / totalRequired < 0.3 ? 'low' : 'adequate';
    }

    return materials[materialIndex];
  }

  static deleteMaterial(id: number, userId: string): boolean {
    const materialIndex = materials.findIndex(m => m.id === id);
    if (materialIndex === -1) return false;

    const material = materials[materialIndex];
    const project = projects.find(p => p.id === material.project_id && p.user_id === userId);
    if (!project) return false;

    materials.splice(materialIndex, 1);
    return true;
  }

  static getUserMaterials(userId: string): Material[] {
    const userProjects = projects.filter(p => p.user_id === userId);
    const projectIds = userProjects.map(p => p.id);
    return materials.filter(m => projectIds.includes(m.project_id));
  }
}
