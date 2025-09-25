import { supabase } from './database';
import { FallbackDatabase } from './database-fallback';
import { Database } from './types';

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return process.env.SUPABASE_URL && 
         process.env.SUPABASE_URL !== 'https://your-project.supabase.co' &&
         process.env.SUPABASE_ANON_KEY && 
         process.env.SUPABASE_ANON_KEY !== 'your-anon-key';
};

type DbProject = Database['public']['Tables']['projects']['Row'];
type DbMaterial = Database['public']['Tables']['materials']['Row'];

export interface Project {
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
  client?: string | null;
  location?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  team_size?: number | null;
  contractor?: string | null;
  created_at: string;
  updated_at: string;
  materials?: Material[];
}

export interface Material extends DbMaterial {
  // Additional fields if needed
}

export class ProjectsService {
  static async getUserProjects(userId: string): Promise<Project[]> {
    if (isSupabaseConfigured()) {
      const { data: projects, error } = await supabase
        .from('projects')
        .select(`
          *,
          materials (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        return [];
      }

      return projects || [];
    } else {
      return FallbackDatabase.getUserProjects(userId);
    }
  }

  static async getProjectById(id: number, userId: string): Promise<Project | null> {
    if (isSupabaseConfigured()) {
      const { data: project, error } = await supabase
        .from('projects')
        .select(`
          *,
          materials (*)
        `)
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error || !project) {
        return null;
      }

      return project;
    } else {
      return FallbackDatabase.getProjectById(id, userId);
    }
  }

  static async createProject(projectData: Partial<DbProject>, userId: string): Promise<Project | null> {
    if (isSupabaseConfigured()) {
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          name: projectData.name || '',
          budget: projectData.budget || 0,
          client: projectData.client || null,
          location: projectData.location || null,
          start_date: projectData.start_date || null,
          end_date: projectData.end_date || null,
          contractor: projectData.contractor || null,
          user_id: userId,
        })
        .select(`
          *,
          materials (*)
        `)
        .single();

      if (error || !project) {
        console.error('Error creating project:', error);
        return null;
      }

      return project;
    } else {
      return FallbackDatabase.createProject(projectData, userId);
    }
  }

  static async updateProject(id: number, updates: Partial<DbProject>, userId: string): Promise<Project | null> {
    if (isSupabaseConfigured()) {
      const { data: project, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select(`
          *,
          materials (*)
        `)
        .single();

      if (error || !project) {
        console.error('Error updating project:', error);
        return null;
      }

      return project;
    } else {
      return FallbackDatabase.updateProject(id, updates, userId);
    }
  }

  static async deleteProject(id: number, userId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting project:', error);
        return false;
      }

      return true;
    } else {
      return FallbackDatabase.deleteProject(id, userId);
    }
  }

  // Materials CRUD operations
  static async getProjectMaterials(projectId: number, userId: string): Promise<Material[]> {
    if (isSupabaseConfigured()) {
      // First verify user owns the project
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();

      if (!project) {
        return [];
      }

      const { data: materials, error } = await supabase
        .from('materials')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching materials:', error);
        return [];
      }

      return materials || [];
    } else {
      return FallbackDatabase.getProjectMaterials(projectId, userId);
    }
  }

  static async createMaterial(materialData: Omit<DbMaterial, 'id' | 'project_id' | 'created_at' | 'updated_at' | 'status'>, projectId: number, userId: string): Promise<Material | null> {
    if (isSupabaseConfigured()) {
      // First verify user owns the project
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();

      if (!project) {
        return null;
      }

      const { data: material, error } = await supabase
        .from('materials')
        .insert({
          name: materialData.name,
          current_stock: materialData.current_stock,
          total_required: materialData.total_required,
          status: 'adequate',
          cost: materialData.cost,
          supplier: materialData.supplier,
          project_id: projectId,
        })
        .select()
        .single();

      if (error || !material) {
        console.error('Error creating material:', error);
        return null;
      }

      return material;
    } else {
      return FallbackDatabase.createMaterial(materialData, projectId, userId);
    }
  }

  static async updateMaterial(id: number, updates: Partial<DbMaterial>, userId: string): Promise<Material | null> {
    if (isSupabaseConfigured()) {
      // First verify user owns the project that contains this material
      const { data: material } = await supabase
        .from('materials')
        .select(`
          *,
          projects!inner (user_id)
        `)
        .eq('id', id)
        .single();

      if (!material || material.projects.user_id !== userId) {
        return null;
      }

      const { data: updatedMaterial, error } = await supabase
        .from('materials')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error || !updatedMaterial) {
        console.error('Error updating material:', error);
        return null;
      }

      return updatedMaterial;
    } else {
      return FallbackDatabase.updateMaterial(id, updates, userId);
    }
  }

  static async deleteMaterial(id: number, userId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      // First verify user owns the project that contains this material
      const { data: material } = await supabase
        .from('materials')
        .select(`
          *,
          projects!inner (user_id)
        `)
        .eq('id', id)
        .single();

      if (!material || material.projects.user_id !== userId) {
        return false;
      }

      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting material:', error);
        return false;
      }

      return true;
    } else {
      return FallbackDatabase.deleteMaterial(id, userId);
    }
  }

  static async getUserMaterials(userId: string): Promise<Material[]> {
    if (isSupabaseConfigured()) {
      const { data: materials, error } = await supabase
        .from('materials')
        .select(`
          *,
          projects!inner (user_id)
        `)
        .eq('projects.user_id', userId);

      if (error) {
        console.error('Error fetching user materials:', error);
        return [];
      }

      return materials || [];
    } else {
      return FallbackDatabase.getUserMaterials(userId);
    }
  }
}
