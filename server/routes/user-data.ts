/**
 * User Data Management Routes
 * Handles comprehensive user data retrieval and management
 */

import { RequestHandler } from "express";
import { z } from "zod";
import { AuthService } from "../lib/auth-service";
import { ProjectsService } from "../lib/projects-service";
import { NotificationService } from "../lib/notifications";

// Extended user data interface
export interface UserDataResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'manager' | 'user';
    avatar?: string;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
    isActive: boolean;
    preferences: {
      theme: 'light' | 'dark' | 'auto';
      language: string;
      notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
      };
      dashboard: {
        layout: 'grid' | 'list';
        widgets: string[];
      };
    };
    statistics: {
      totalProjects: number;
      activeProjects: number;
      completedProjects: number;
      totalMaterials: number;
      totalFiles: number;
      lastActivity: string;
    };
    permissions: {
      canCreateProjects: boolean;
      canManageUsers: boolean;
      canAccessAnalytics: boolean;
      canManageIoT: boolean;
      canAccessBlockchain: boolean;
      canManageVRAR: boolean;
      canManageAutomation: boolean;
    };
  };
  recentActivity: {
    id: string;
    type: 'project_created' | 'material_added' | 'file_uploaded' | 'notification_received' | 'login';
    description: string;
    timestamp: string;
    metadata?: Record<string, any>;
  }[];
  notifications: {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    read: boolean;
    timestamp: string;
    actionUrl?: string;
  }[];
}

// Validation schemas
const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'auto']).optional(),
    language: z.string().optional(),
    notifications: z.object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      sms: z.boolean().optional(),
    }).optional(),
    dashboard: z.object({
      layout: z.enum(['grid', 'list']).optional(),
      widgets: z.array(z.string()).optional(),
    }).optional(),
  }).optional(),
});

const getUserActivitySchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  type: z.enum(['all', 'projects', 'materials', 'files', 'notifications']).default('all'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * Get comprehensive user data including profile, statistics, and recent activity
 */
export const handleGetUserData: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get user profile
    const dbUser = await AuthService.findUserById(userId);
    if (!dbUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user statistics
    const projects = await ProjectsService.getUserProjects(userId);
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    
    // Get materials count
    const materials = await ProjectsService.getUserMaterials(userId);
    const totalMaterials = materials.length;

    // Get files count (mock for now)
    const totalFiles = 0; // Real data from database

    // Get recent activity (mock for now)
    const recentActivity = [
      {
        id: '1',
        type: 'project_created' as const,
        description: 'Created new project "Office Building Alpha"',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        metadata: { projectId: 'proj_123', projectName: 'Office Building Alpha' }
      },
      {
        id: '2',
        type: 'material_added' as const,
        description: 'Added 50 bags of cement to project',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        metadata: { materialId: 'mat_456', quantity: 50, material: 'Cement' }
      },
      {
        id: '3',
        type: 'file_uploaded' as const,
        description: 'Uploaded blueprint.pdf',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        metadata: { fileId: 'file_789', fileName: 'blueprint.pdf', size: '2.5MB' }
      },
      {
        id: '4',
        type: 'login' as const,
        description: 'Logged in successfully',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
      }
    ];

    // Get notifications (mock for now)
    const notifications = [
      {
        id: 'notif_1',
        type: 'info' as const,
        title: 'Project Update',
        message: 'Project "Office Building Alpha" is 75% complete',
        read: false,
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        actionUrl: '/projects/proj_123'
      },
      {
        id: 'notif_2',
        type: 'warning' as const,
        title: 'Material Low Stock',
        message: 'Steel beams are running low (15 remaining)',
        read: true,
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        actionUrl: '/materials'
      }
    ];

    // Determine permissions based on role
    const permissions = {
      canCreateProjects: true,
      canManageUsers: dbUser.role === 'admin',
      canAccessAnalytics: dbUser.role === 'admin' || dbUser.role === 'manager',
      canManageIoT: dbUser.role === 'admin' || dbUser.role === 'manager',
      canAccessBlockchain: dbUser.role === 'admin' || dbUser.role === 'manager',
      canManageVRAR: dbUser.role === 'admin' || dbUser.role === 'manager',
      canManageAutomation: dbUser.role === 'admin' || dbUser.role === 'manager',
    };

    // Build user data response
    const userData: UserDataResponse = {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        avatar: dbUser.avatar,
        createdAt: dbUser.createdAt.toISOString(),
        updatedAt: dbUser.updatedAt.toISOString(),
        lastLoginAt: new Date().toISOString(), // Mock last login
        isActive: true,
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          dashboard: {
            layout: 'grid',
            widgets: ['projects', 'materials', 'notifications', 'analytics'],
          },
        },
        statistics: {
          totalProjects,
          activeProjects,
          completedProjects,
          totalMaterials,
          totalFiles,
          lastActivity: recentActivity[0]?.timestamp || new Date().toISOString(),
        },
        permissions,
      },
      recentActivity,
      notifications,
    };

    res.json(userData);
  } catch (error) {
    console.error('Get user data error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update user profile and preferences
 */
export const handleUpdateUserData: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const validation = updateUserSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        errors: validation.error.issues.map(err => ({
          message: err.message,
          field: err.path.join('.'),
        }))
      });
    }

    const updateData = validation.data;

    // Update user in database
    const updatedUser = await AuthService.updateUser(userId, updateData);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Transform to response format
    const user = AuthService.transformDbUserToUser(updatedUser);
    res.json({ user, message: 'User data updated successfully' });
  } catch (error) {
    console.error('Update user data error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get user activity with filtering and pagination
 */
export const handleGetUserActivity: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const validation = getUserActivitySchema.safeParse({
      ...req.query,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
    });

    if (!validation.success) {
      return res.status(400).json({ 
        errors: validation.error.issues.map(err => ({
          message: err.message,
          field: err.path.join('.'),
        }))
      });
    }

    const { limit, offset, type, startDate, endDate } = validation.data;

    // Mock activity data (in real implementation, this would come from a database)
    const allActivities = [
      {
        id: '1',
        type: 'project_created' as const,
        description: 'Created new project "Office Building Alpha"',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        metadata: { projectId: 'proj_123', projectName: 'Office Building Alpha' }
      },
      {
        id: '2',
        type: 'material_added' as const,
        description: 'Added 50 bags of cement to project',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        metadata: { materialId: 'mat_456', quantity: 50, material: 'Cement' }
      },
      {
        id: '3',
        type: 'file_uploaded' as const,
        description: 'Uploaded blueprint.pdf',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        metadata: { fileId: 'file_789', fileName: 'blueprint.pdf', size: '2.5MB' }
      },
      {
        id: '4',
        type: 'notification_received' as const,
        description: 'Received notification about project update',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        metadata: { notificationId: 'notif_1', type: 'info' }
      },
      {
        id: '5',
        type: 'login' as const,
        description: 'Logged in successfully',
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      }
    ];

    // Filter activities based on type
    let filteredActivities = allActivities;
    if (type !== 'all') {
      filteredActivities = allActivities.filter(activity => {
        switch (type) {
          case 'projects':
            return activity.type === 'project_created';
          case 'materials':
            return activity.type === 'material_added';
          case 'files':
            return activity.type === 'file_uploaded';
          case 'notifications':
            return activity.type === 'notification_received';
          default:
            return true;
        }
      });
    }

    // Apply date filters if provided
    if (startDate || endDate) {
      filteredActivities = filteredActivities.filter(activity => {
        const activityDate = new Date(activity.timestamp);
        if (startDate && activityDate < new Date(startDate)) return false;
        if (endDate && activityDate > new Date(endDate)) return false;
        return true;
      });
    }

    // Apply pagination
    const paginatedActivities = filteredActivities.slice(offset, offset + limit);

    res.json({
      activities: paginatedActivities,
      pagination: {
        total: filteredActivities.length,
        limit,
        offset,
        hasMore: offset + limit < filteredActivities.length,
      },
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get user statistics and metrics
 */
export const handleGetUserStatistics: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get user projects
    const projects = await ProjectsService.getUserProjects(userId);
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const planningProjects = projects.filter(p => p.status === 'planning').length;

    // Get materials
    const materials = await ProjectsService.getUserMaterials(userId);
    const totalMaterials = materials.length;
    const lowStockMaterials = materials.filter(m => m.currentStock < m.minStock).length;

    // Calculate project progress
    const averageProgress = projects.length > 0 
      ? projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length 
      : 0;

    // Mock additional statistics
    const statistics = {
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        planning: planningProjects,
        averageProgress: Math.round(averageProgress),
      },
      materials: {
        total: totalMaterials,
        lowStock: lowStockMaterials,
        inStock: totalMaterials - lowStockMaterials,
      },
      files: {
        total: 0,
        totalSize: '125.5 MB',
        recentUploads: 3,
      },
      activity: {
        thisWeek: 15,
        thisMonth: 45,
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      performance: {
        projectCompletionRate: Math.round((completedProjects / totalProjects) * 100) || 0,
        averageProjectDuration: '45 days',
        onTimeDelivery: '85%',
      },
    };

    res.json(statistics);
  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get user preferences
 */
export const handleGetUserPreferences: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Mock preferences (in real implementation, this would come from database)
    const preferences = {
      theme: 'light' as const,
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      notifications: {
        email: true,
        push: true,
        sms: false,
        projectUpdates: true,
        materialAlerts: true,
        systemNotifications: false,
      },
      dashboard: {
        layout: 'grid' as const,
        widgets: ['projects', 'materials', 'notifications', 'analytics'],
        refreshInterval: 30000, // 30 seconds
      },
      privacy: {
        profileVisibility: 'team' as const,
        activitySharing: true,
        dataExport: true,
      },
      accessibility: {
        highContrast: false,
        fontSize: 'medium',
        screenReader: false,
      },
    };

    res.json(preferences);
  } catch (error) {
    console.error('Get user preferences error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update user preferences
 */
export const handleUpdateUserPreferences: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const preferencesSchema = z.object({
      theme: z.enum(['light', 'dark', 'auto']).optional(),
      language: z.string().optional(),
      timezone: z.string().optional(),
      dateFormat: z.string().optional(),
      notifications: z.object({
        email: z.boolean().optional(),
        push: z.boolean().optional(),
        sms: z.boolean().optional(),
        projectUpdates: z.boolean().optional(),
        materialAlerts: z.boolean().optional(),
        systemNotifications: z.boolean().optional(),
      }).optional(),
      dashboard: z.object({
        layout: z.enum(['grid', 'list']).optional(),
        widgets: z.array(z.string()).optional(),
        refreshInterval: z.number().min(10000).max(300000).optional(),
      }).optional(),
      privacy: z.object({
        profileVisibility: z.enum(['public', 'team', 'private']).optional(),
        activitySharing: z.boolean().optional(),
        dataExport: z.boolean().optional(),
      }).optional(),
      accessibility: z.object({
        highContrast: z.boolean().optional(),
        fontSize: z.enum(['small', 'medium', 'large']).optional(),
        screenReader: z.boolean().optional(),
      }).optional(),
    });

    const validation = preferencesSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        errors: validation.error.issues.map(err => ({
          message: err.message,
          field: err.path.join('.'),
        }))
      });
    }

    // In real implementation, save preferences to database
    // For now, just return success
    res.json({ 
      message: 'Preferences updated successfully',
      preferences: validation.data 
    });
  } catch (error) {
    console.error('Update user preferences error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
