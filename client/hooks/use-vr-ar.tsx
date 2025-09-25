/**
 * VR/AR Service Hook
 * Provides virtual and augmented reality operations
 */

import { useState, useCallback } from 'react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from './use-auth';

export interface VRSession {
  id: string;
  name: string;
  description: string;
  type: 'training' | 'presentation' | 'inspection' | 'collaboration';
  status: 'draft' | 'active' | 'completed' | 'paused';
  participants: string[];
  maxParticipants: number;
  environment: string;
  assets: string[];
  settings: {
    physics: boolean;
    lighting: string;
    audio: boolean;
    haptics: boolean;
  };
  duration: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AROverlay {
  id: string;
  name: string;
  description: string;
  type: 'measurement' | 'instruction' | 'information' | 'safety' | 'navigation';
  status: 'draft' | 'active' | 'archived';
  target: {
    type: 'marker' | 'image' | 'location' | 'object';
    identifier: string;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
  };
  content: {
    text?: string;
    images?: string[];
    videos?: string[];
    models?: string[];
    animations?: string[];
  };
  interactions: {
    type: 'tap' | 'swipe' | 'voice' | 'gesture';
    action: string;
    parameters: Record<string, any>;
  }[];
  visibility: {
    distance: number;
    angle: number;
    conditions: string[];
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Model3D {
  id: string;
  name: string;
  description: string;
  type: 'building' | 'equipment' | 'material' | 'furniture' | 'decoration';
  format: 'obj' | 'fbx' | 'gltf' | 'glb' | 'stl' | 'ply';
  file: string;
  thumbnail: string;
  metadata: {
    vertices: number;
    faces: number;
    materials: number;
    textures: number;
    size: number;
    boundingBox: {
      min: { x: number; y: number; z: number };
      max: { x: number; y: number; z: number };
    };
  };
  tags: string[];
  category: string;
  version: string;
  uploadedAt: string;
  uploadedBy: string;
  status: 'processing' | 'ready' | 'error';
}

export interface VRTrainingSession {
  id: string;
  name: string;
  description: string;
  type: 'safety' | 'equipment' | 'procedure' | 'emergency';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  objectives: string[];
  scenarios: {
    id: string;
    name: string;
    description: string;
    environment: string;
    tasks: string[];
    successCriteria: string[];
  }[];
  participants: {
    userId: string;
    progress: number;
    score: number;
    completedAt?: string;
  }[];
  analytics: {
    averageScore: number;
    completionRate: number;
    averageTime: number;
    commonMistakes: string[];
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ARSiteInspection {
  id: string;
  name: string;
  description: string;
  siteId: string;
  inspectorId: string;
  type: 'safety' | 'quality' | 'compliance' | 'progress';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  checklist: {
    id: string;
    category: string;
    items: {
      id: string;
      description: string;
      type: 'text' | 'photo' | 'measurement' | 'checklist';
      required: boolean;
      completed: boolean;
      value?: any;
      notes?: string;
      timestamp?: string;
    }[];
  }[];
  findings: {
    id: string;
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    location: { x: number; y: number; z: number };
    photos: string[];
    recommendations: string[];
    status: 'open' | 'in_progress' | 'resolved';
  }[];
  startTime: string;
  endTime?: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface VRClientPresentation {
  id: string;
  name: string;
  description: string;
  projectId: string;
  presenterId: string;
  clientId: string;
  type: 'design_review' | 'progress_update' | 'final_presentation';
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  environment: string;
  assets: string[];
  interactions: {
    type: 'walkthrough' | 'exploration' | 'annotation' | 'comparison';
    enabled: boolean;
    settings: Record<string, any>;
  }[];
  feedback: {
    clientId: string;
    rating: number;
    comments: string;
    timestamp: string;
  }[];
  duration: number;
  scheduledAt: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ARProgressVisualization {
  id: string;
  name: string;
  description: string;
  projectId: string;
  type: 'timeline' | 'comparison' | 'forecast' | 'milestone';
  status: 'draft' | 'active' | 'archived';
  data: {
    milestones: {
      id: string;
      name: string;
      date: string;
      status: 'completed' | 'in_progress' | 'pending';
      progress: number;
    }[];
    timeline: {
      date: string;
      progress: number;
      activities: string[];
    }[];
    forecast: {
      date: string;
      predictedProgress: number;
      confidence: number;
    }[];
  };
  visualization: {
    type: 'chart' | 'timeline' | '3d_model' | 'ar_overlay';
    settings: Record<string, any>;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export function useVRAR() {
  const { user, token } = useAuth();
  const [vrSessions, setVrSessions] = useState<VRSession[]>([]);
  const [arOverlays, setArOverlays] = useState<AROverlay[]>([]);
  const [models3D, setModels3D] = useState<Model3D[]>([]);
  const [trainingSessions, setTrainingSessions] = useState<VRTrainingSession[]>([]);
  const [siteInspections, setSiteInspections] = useState<ARSiteInspection[]>([]);
  const [clientPresentations, setClientPresentations] = useState<VRClientPresentation[]>([]);
  const [progressVisualizations, setProgressVisualizations] = useState<ARProgressVisualization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createVRSession = useCallback(async (sessionData: Partial<VRSession>) => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const newSession = await api.createVRSession(sessionData);
      setVrSessions(prev => [...prev, newSession]);
      return newSession;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create VR session');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createAROverlay = useCallback(async (overlayData: Partial<AROverlay>) => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const newOverlay = await api.createAROverlay(overlayData);
      setArOverlays(prev => [...prev, newOverlay]);
      return newOverlay;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create AR overlay');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const upload3DModel = useCallback(async (modelData: Partial<Model3D>, file: File) => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const newModel = await api.upload3DModel(modelData, file);
      setModels3D(prev => [...prev, newModel]);
      return newModel;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to upload 3D model');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createVRTrainingSession = useCallback(async (trainingData: Partial<VRTrainingSession>) => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const newTraining = await api.createVRTrainingSession(trainingData);
      setTrainingSessions(prev => [...prev, newTraining]);
      return newTraining;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create VR training session');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createARSiteInspection = useCallback(async (inspectionData: Partial<ARSiteInspection>) => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const newInspection = await api.createARSiteInspection(inspectionData);
      setSiteInspections(prev => [...prev, newInspection]);
      return newInspection;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create AR site inspection');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createVRClientPresentation = useCallback(async (presentationData: Partial<VRClientPresentation>) => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const newPresentation = await api.createVRClientPresentation(presentationData);
      setClientPresentations(prev => [...prev, newPresentation]);
      return newPresentation;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create VR client presentation');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createARProgressVisualization = useCallback(async (visualizationData: Partial<ARProgressVisualization>) => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const newVisualization = await api.createARProgressVisualization(visualizationData);
      setProgressVisualizations(prev => [...prev, newVisualization]);
      return newVisualization;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create AR progress visualization');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    vrSessions,
    arOverlays,
    models3D,
    trainingSessions,
    siteInspections,
    clientPresentations,
    progressVisualizations,
    loading,
    error,
    createVRSession,
    createAROverlay,
    upload3DModel,
    createVRTrainingSession,
    createARSiteInspection,
    createVRClientPresentation,
    createARProgressVisualization,
  };
}
