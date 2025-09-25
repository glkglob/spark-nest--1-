/**
 * Automation Service Hook
 * Provides workflow automation and intelligent document processing
 */

import { useState, useCallback } from 'react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from './use-auth';

export interface Workflow {
  id: string;
  name: string;
  description: string;
  type: 'approval' | 'notification' | 'data_processing' | 'report_generation' | 'integration';
  status: 'draft' | 'active' | 'paused' | 'archived';
  triggers: WorkflowTrigger[];
  steps: WorkflowStep[];
  variables: Record<string, any>;
  settings: {
    retryAttempts: number;
    timeout: number;
    parallelExecution: boolean;
    errorHandling: 'stop' | 'continue' | 'retry';
  };
  statistics: {
    executions: number;
    successRate: number;
    averageExecutionTime: number;
    lastExecution: string;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface WorkflowTrigger {
  id: string;
  type: 'schedule' | 'event' | 'webhook' | 'manual' | 'condition';
  name: string;
  configuration: Record<string, any>;
  enabled: boolean;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'action' | 'condition' | 'loop' | 'delay' | 'notification' | 'integration';
  configuration: Record<string, any>;
  dependencies: string[];
  timeout: number;
  retryAttempts: number;
  onError: 'stop' | 'continue' | 'retry';
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  type: 'data_validation' | 'quality_control' | 'safety_check' | 'compliance' | 'performance';
  status: 'active' | 'inactive' | 'testing';
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  frequency: 'real_time' | 'daily' | 'weekly' | 'monthly' | 'on_demand';
  statistics: {
    triggers: number;
    successes: number;
    failures: number;
    lastTriggered: string;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AutomationCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'regex';
  value: any;
  logicalOperator: 'AND' | 'OR';
}

export interface AutomationAction {
  id: string;
  type: 'notification' | 'data_update' | 'workflow_trigger' | 'integration_call' | 'report_generation';
  configuration: Record<string, any>;
  delay: number;
  retryAttempts: number;
}

export interface SmartSchedule {
  id: string;
  name: string;
  description: string;
  type: 'resource_allocation' | 'task_scheduling' | 'maintenance' | 'delivery' | 'meeting';
  status: 'active' | 'paused' | 'completed';
  constraints: {
    time: {
      startDate: string;
      endDate: string;
      workingHours: { start: string; end: string };
      holidays: string[];
    };
    resources: {
      personnel: string[];
      equipment: string[];
      materials: string[];
      budget: number;
    };
    dependencies: {
      taskId: string;
      dependencyType: 'finish_to_start' | 'start_to_start' | 'finish_to_finish';
      lag: number;
    }[];
  };
  optimization: {
    objective: 'minimize_time' | 'minimize_cost' | 'maximize_quality' | 'balance_all';
    weights: {
      time: number;
      cost: number;
      quality: number;
    };
    algorithm: 'genetic' | 'simulated_annealing' | 'constraint_satisfaction';
  };
  schedule: {
    tasks: {
      id: string;
      name: string;
      duration: number;
      startTime: string;
      endTime: string;
      assignedResources: string[];
      dependencies: string[];
    }[];
    conflicts: {
      type: 'resource_overlap' | 'dependency_violation' | 'constraint_violation';
      severity: 'low' | 'medium' | 'high';
      description: string;
      affectedTasks: string[];
    }[];
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface QualityControl {
  id: string;
  name: string;
  description: string;
  type: 'automated' | 'semi_automated' | 'manual';
  status: 'active' | 'inactive' | 'testing';
  checks: QualityCheck[];
  thresholds: {
    pass: number;
    warning: number;
    fail: number;
  };
  reporting: {
    frequency: 'real_time' | 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    format: 'email' | 'dashboard' | 'api';
  };
  statistics: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    warningChecks: number;
    averageScore: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface QualityCheck {
  id: string;
  name: string;
  type: 'measurement' | 'visual' | 'functional' | 'compliance' | 'performance';
  description: string;
  criteria: {
    parameter: string;
    operator: 'equals' | 'greater_than' | 'less_than' | 'between' | 'contains';
    value: any;
    tolerance: number;
  }[];
  automation: {
    enabled: boolean;
    sensor: string;
    frequency: number;
    alertThreshold: number;
  };
  results: {
    timestamp: string;
    value: any;
    status: 'pass' | 'warning' | 'fail';
    notes: string;
    inspector: string;
  }[];
}

export interface ResourceAllocation {
  id: string;
  name: string;
  description: string;
  type: 'personnel' | 'equipment' | 'materials' | 'budget' | 'space';
  status: 'active' | 'completed' | 'cancelled';
  projectId: string;
  requirements: {
    resource: string;
    quantity: number;
    startDate: string;
    endDate: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    constraints: string[];
  }[];
  allocations: {
    resource: string;
    allocated: number;
    available: number;
    utilization: number;
    efficiency: number;
  }[];
  optimization: {
    algorithm: 'linear_programming' | 'genetic' | 'simulated_annealing';
    objective: 'minimize_cost' | 'maximize_utilization' | 'minimize_waste';
    constraints: string[];
    solution: {
      totalCost: number;
      totalUtilization: number;
      waste: number;
      efficiency: number;
    };
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AutomatedReport {
  id: string;
  name: string;
  description: string;
  type: 'progress' | 'financial' | 'quality' | 'safety' | 'compliance' | 'custom';
  status: 'draft' | 'scheduled' | 'generating' | 'completed' | 'failed';
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
    time: string;
    timezone: string;
    nextRun: string;
    lastRun?: string;
  };
  data: {
    sources: string[];
    filters: Record<string, any>;
    aggregations: string[];
    calculations: string[];
  };
  format: {
    type: 'pdf' | 'excel' | 'csv' | 'json' | 'html';
    template: string;
    styling: Record<string, any>;
  };
  distribution: {
    recipients: string[];
    method: 'email' | 'api' | 'storage' | 'dashboard';
    settings: Record<string, any>;
  };
  history: {
    runId: string;
    timestamp: string;
    status: 'success' | 'failed' | 'partial';
    duration: number;
    records: number;
    size: number;
    error?: string;
  }[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface DocumentProcessing {
  id: string;
  name: string;
  description: string;
  type: 'invoice' | 'contract' | 'permit' | 'report' | 'blueprint' | 'general';
  status: 'processing' | 'completed' | 'failed' | 'requires_review';
  input: {
    file: string;
    format: 'pdf' | 'docx' | 'txt' | 'image' | 'email';
    size: number;
    pages: number;
  };
  extraction: {
    text: string;
    entities: {
      type: string;
      value: string;
      confidence: number;
      position: { page: number; x: number; y: number; width: number; height: number };
    }[];
    tables: {
      id: string;
      data: any[][];
      headers: string[];
      confidence: number;
    }[];
    images: {
      id: string;
      description: string;
      confidence: number;
      position: { page: number; x: number; y: number; width: number; height: number };
    }[];
  };
  classification: {
    category: string;
    confidence: number;
    tags: string[];
    urgency: 'low' | 'medium' | 'high' | 'critical';
  };
  validation: {
    requiredFields: string[];
    missingFields: string[];
    invalidFields: string[];
    warnings: string[];
  };
  output: {
    structuredData: Record<string, any>;
    summary: string;
    recommendations: string[];
    nextSteps: string[];
  };
  processingTime: number;
  createdAt: string;
  updatedAt: string;
  processedBy: string;
}

export function useAutomation() {
  const { user, token } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [smartSchedules, setSmartSchedules] = useState<SmartSchedule[]>([]);
  const [qualityControls, setQualityControls] = useState<QualityControl[]>([]);
  const [resourceAllocations, setResourceAllocations] = useState<ResourceAllocation[]>([]);
  const [automatedReports, setAutomatedReports] = useState<AutomatedReport[]>([]);
  const [documentProcessing, setDocumentProcessing] = useState<DocumentProcessing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createWorkflow = useCallback(async (workflowData: Partial<Workflow>) => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const newWorkflow = await api.createWorkflow(workflowData);
      setWorkflows(prev => [...prev, newWorkflow]);
      return newWorkflow;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create workflow');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createAutomationRule = useCallback(async (ruleData: Partial<AutomationRule>) => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const newRule = await api.createAutomationRule(ruleData);
      setAutomationRules(prev => [...prev, newRule]);
      return newRule;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create automation rule');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createSmartSchedule = useCallback(async (scheduleData: Partial<SmartSchedule>) => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const newSchedule = await api.createSmartSchedule(scheduleData);
      setSmartSchedules(prev => [...prev, newSchedule]);
      return newSchedule;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create smart schedule');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createQualityControl = useCallback(async (qualityData: Partial<QualityControl>) => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const newQuality = await api.createQualityControl(qualityData);
      setQualityControls(prev => [...prev, newQuality]);
      return newQuality;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create quality control');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createResourceAllocation = useCallback(async (allocationData: Partial<ResourceAllocation>) => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const newAllocation = await api.createResourceAllocation(allocationData);
      setResourceAllocations(prev => [...prev, newAllocation]);
      return newAllocation;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create resource allocation');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createAutomatedReport = useCallback(async (reportData: Partial<AutomatedReport>) => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const newReport = await api.createAutomatedReport(reportData);
      setAutomatedReports(prev => [...prev, newReport]);
      return newReport;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create automated report');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const processDocument = useCallback(async (documentData: Partial<DocumentProcessing>, file: File) => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const newDocument = await api.processDocument(documentData, file);
      setDocumentProcessing(prev => [...prev, newDocument]);
      return newDocument;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to process document');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    workflows,
    automationRules,
    smartSchedules,
    qualityControls,
    resourceAllocations,
    automatedReports,
    documentProcessing,
    loading,
    error,
    createWorkflow,
    createAutomationRule,
    createSmartSchedule,
    createQualityControl,
    createResourceAllocation,
    createAutomatedReport,
    processDocument,
  };
}
