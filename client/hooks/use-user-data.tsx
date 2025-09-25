/**
 * User Data Service Hook
 * Provides comprehensive user data management and retrieval
 */

import { useState, useCallback } from 'react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from './use-auth';

export interface UserData {
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

export interface UserActivity {
  id: string;
  type: 'project_created' | 'material_added' | 'file_uploaded' | 'notification_received' | 'login';
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface UserStatistics {
  projects: {
    total: number;
    active: number;
    completed: number;
    planning: number;
    averageProgress: number;
  };
  materials: {
    total: number;
    lowStock: number;
    inStock: number;
  };
  files: {
    total: number;
    totalSize: string;
    recentUploads: number;
  };
  activity: {
    thisWeek: number;
    thisMonth: number;
    lastLogin: string;
  };
  performance: {
    projectCompletionRate: number;
    averageProjectDuration: string;
    onTimeDelivery: string;
  };
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    projectUpdates: boolean;
    materialAlerts: boolean;
    systemNotifications: boolean;
  };
  dashboard: {
    layout: 'grid' | 'list';
    widgets: string[];
    refreshInterval: number;
  };
  privacy: {
    profileVisibility: 'public' | 'team' | 'private';
    activitySharing: boolean;
    dataExport: boolean;
  };
  accessibility: {
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
    screenReader: boolean;
  };
}

export function useUserData() {
  const { user, token } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activity, setActivity] = useState<UserActivity[]>([]);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserData = useCallback(async () => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.getUserData();
      setUserData(data);
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to get user data');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const updateUserData = useCallback(async (updateData: Partial<UserData['user']>) => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.updateUserData(updateData);
      if (userData) {
        setUserData({ ...userData, user: { ...userData.user, ...data.user } });
      }
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to update user data');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, userData]);

  const getUserActivity = useCallback(async (params?: {
    limit?: number;
    offset?: number;
    type?: 'all' | 'projects' | 'materials' | 'files' | 'notifications';
    startDate?: string;
    endDate?: string;
  }) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      const data = await api.getUserActivity(params);
      setActivity(data.activities);
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to get user activity');
      }
      throw err;
    }
  }, [token]);

  const getUserStatistics = useCallback(async () => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      const data = await api.getUserStatistics();
      setStatistics(data);
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to get user statistics');
      }
      throw err;
    }
  }, [token]);

  const getUserPreferences = useCallback(async () => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      const data = await api.getUserPreferences();
      setPreferences(data);
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to get user preferences');
      }
      throw err;
    }
  }, [token]);

  const updateUserPreferences = useCallback(async (updateData: Partial<UserPreferences>) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      const data = await api.updateUserPreferences(updateData);
      if (preferences) {
        setPreferences({ ...preferences, ...updateData });
      }
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to update user preferences');
      }
      throw err;
    }
  }, [token, preferences]);

  return {
    userData,
    activity,
    statistics,
    preferences,
    loading,
    error,
    getUserData,
    updateUserData,
    getUserActivity,
    getUserStatistics,
    getUserPreferences,
    updateUserPreferences,
  };
}
