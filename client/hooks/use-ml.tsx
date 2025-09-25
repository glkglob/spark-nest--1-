/**
 * ML Training Service Hook
 * Provides machine learning model training and management
 */

import { useState, useCallback } from 'react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from './use-auth';

export interface MLModel {
  id: string;
  name: string;
  description: string;
  type: 'classification' | 'regression' | 'clustering' | 'deep_learning' | 'nlp';
  algorithm: string;
  status: 'draft' | 'training' | 'trained' | 'deployed' | 'failed';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  dataset: {
    name: string;
    size: number;
    features: number;
    samples: number;
  };
  hyperparameters: Record<string, any>;
  trainingHistory: {
    epoch: number;
    loss: number;
    accuracy: number;
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: string;
}

export interface MLPipeline {
  id: string;
  name: string;
  description: string;
  steps: MLPipelineStep[];
  status: 'draft' | 'running' | 'completed' | 'failed';
  inputData: string;
  outputData: string;
  executionTime: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface MLPipelineStep {
  id: string;
  type: 'data_preprocessing' | 'feature_engineering' | 'model_training' | 'validation' | 'prediction';
  name: string;
  parameters: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output: any;
  executionTime: number;
  dependencies: string[];
}

export interface MLDataset {
  id: string;
  name: string;
  description: string;
  type: 'csv' | 'json' | 'parquet' | 'database';
  size: number;
  features: number;
  samples: number;
  columns: string[];
  preview: any[];
  uploadedAt: string;
  uploadedBy: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
}

export interface MLPrediction {
  id: string;
  modelId: string;
  inputData: Record<string, any>;
  outputData: any;
  confidence: number;
  timestamp: string;
  executionTime: number;
  status: 'pending' | 'completed' | 'failed';
}

export interface MLMetrics {
  modelId: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  confusionMatrix: number[][];
  featureImportance: { feature: string; importance: number }[];
  learningCurve: { epoch: number; train_loss: number; val_loss: number }[];
  validationScores: { fold: number; score: number }[];
}

export interface TrainingStatus {
  modelId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  currentEpoch: number;
  totalEpochs: number;
  loss: number;
  accuracy: number;
  eta: string;
  logs: string[];
  error?: string;
}

export function useML() {
  const { user, token } = useAuth();
  const [models, setModels] = useState<MLModel[]>([]);
  const [pipelines, setPipelines] = useState<MLPipeline[]>([]);
  const [datasets, setDatasets] = useState<MLDataset[]>([]);
  const [predictions, setPredictions] = useState<MLPrediction[]>([]);
  const [metrics, setMetrics] = useState<MLMetrics[]>([]);
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createModel = useCallback(async (modelData: Partial<MLModel>) => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const newModel = await api.createMLModel(modelData);
      setModels(prev => [...prev, newModel]);
      return newModel;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create model');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const startTraining = useCallback(async (modelId: string, trainingConfig: any) => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const training = await api.startMLTraining(modelId, trainingConfig);
      setTrainingStatus(training);
      return training;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to start training');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const getTrainingStatus = useCallback(async (modelId: string) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      const status = await api.getMLTrainingStatus(modelId);
      setTrainingStatus(status);
      return status;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to get training status');
      }
      throw err;
    }
  }, [token]);

  const uploadDataset = useCallback(async (datasetData: Partial<MLDataset>, file: File) => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const newDataset = await api.uploadMLDataset(datasetData, file);
      setDatasets(prev => [...prev, newDataset]);
      return newDataset;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to upload dataset');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createPipeline = useCallback(async (pipelineData: Partial<MLPipeline>) => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const newPipeline = await api.createMLPipeline(pipelineData);
      setPipelines(prev => [...prev, newPipeline]);
      return newPipeline;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create pipeline');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const executePipeline = useCallback(async (pipelineId: string, inputData: any) => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const execution = await api.executeMLPipeline(pipelineId, inputData);
      setPipelines(prev => prev.map(p => p.id === pipelineId ? { ...p, ...execution } : p));
      return execution;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to execute pipeline');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const deployModel = useCallback(async (modelId: string, deploymentConfig: any) => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const deployment = await api.deployMLModel(modelId, deploymentConfig);
      setModels(prev => prev.map(m => m.id === modelId ? { ...m, status: 'deployed' } : m));
      return deployment;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to deploy model');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const getPredictions = useCallback(async (modelId: string, inputData: any) => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const prediction = await api.getMLPredictions(modelId, inputData);
      setPredictions(prev => [...prev, prediction]);
      return prediction;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to get predictions');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const getModelMetrics = useCallback(async (modelId: string) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      const modelMetrics = await api.getMLModelMetrics(modelId);
      setMetrics(prev => prev.map(m => m.modelId === modelId ? modelMetrics : m));
      return modelMetrics;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to get model metrics');
      }
      throw err;
    }
  }, [token]);

  return {
    models,
    pipelines,
    datasets,
    predictions,
    metrics,
    trainingStatus,
    loading,
    error,
    createModel,
    startTraining,
    getTrainingStatus,
    uploadDataset,
    createPipeline,
    executePipeline,
    deployModel,
    getPredictions,
    getModelMetrics,
  };
}