/**
 * IoT Service Hook
 * Provides IoT device management and fleet operations
 */

import { useState, useCallback } from 'react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from './use-auth';

export interface IoTDevice {
  id: string;
  name: string;
  type: 'sensor' | 'camera' | 'equipment' | 'wearable' | 'environmental';
  status: 'online' | 'offline' | 'maintenance' | 'error';
  batteryLevel: number;
  signalStrength: number;
  location: {
    lat: number;
    lon: number;
    zone: string;
  };
  lastSeen: string;
  firmwareVersion: string;
  data: {
    temperature?: number;
    humidity?: number;
    pressure?: number;
    vibration?: number;
    utilization?: number;
  };
  alerts: number;
}

export interface DeviceFleet {
  id: string;
  name: string;
  description: string;
  devices: IoTDevice[];
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  averageBatteryLevel: number;
  criticalAlerts: number;
  lastUpdated: string;
  healthScore: number;
  location: {
    site: string;
    coordinates: { lat: number; lon: number };
  };
}

export interface FleetAnalytics {
  fleetId: string;
  uptime: number;
  dataTransmission: number;
  maintenanceSchedule: {
    nextMaintenance: string;
    overdueMaintenance: number;
    completedMaintenance: number;
  };
  performanceMetrics: {
    averageResponseTime: number;
    errorRate: number;
    dataQuality: number;
  };
}

export interface IoTAlert {
  id: string;
  deviceId: string;
  alertType: 'battery_low' | 'signal_weak' | 'temperature_high' | 'maintenance_due' | 'offline';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export function useIoT() {
  const { user, token } = useAuth();
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [fleets, setFleets] = useState<DeviceFleet[]>([]);
  const [analytics, setAnalytics] = useState<FleetAnalytics[]>([]);
  const [alerts, setAlerts] = useState<IoTAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createFleet = useCallback(async (fleetData: Partial<DeviceFleet>) => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const newFleet = await api.createIoTFleet(fleetData);
      setFleets(prev => [...prev, newFleet]);
      return newFleet;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create fleet');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const registerDevice = useCallback(async (deviceData: Partial<IoTDevice>) => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const newDevice = await api.registerIoTDevice(deviceData);
      setDevices(prev => [...prev, newDevice]);
      return newDevice;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to register device');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const ingestData = useCallback(async (data: any) => {
    try {
      return await api.ingestIoTData(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to ingest data');
      }
      throw err;
    }
  }, []);

  const getFleetAnalytics = useCallback(async (fleetId?: string, timeRange?: string) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      const analyticsData = await api.getFleetAnalytics(fleetId, timeRange);
      if (fleetId) {
        setAnalytics(prev => prev.map(a => a.fleetId === fleetId ? analyticsData : a));
      } else {
        setAnalytics([analyticsData]);
      }
      return analyticsData;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to get fleet analytics');
      }
      throw err;
    }
  }, [token]);

  const getPredictiveMaintenance = useCallback(async (fleetId?: string) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      return await api.getPredictiveMaintenance(fleetId);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to get predictive maintenance');
      }
      throw err;
    }
  }, [token]);

  const configureAlerts = useCallback(async (alertConfig: any) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      return await api.configureIoTAlerts(alertConfig);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to configure alerts');
      }
      throw err;
    }
  }, [token]);

  const getDevicePerformance = useCallback(async (deviceId: string, metrics?: string) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      return await api.getDevicePerformance(deviceId, metrics);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to get device performance');
      }
      throw err;
    }
  }, [token]);

  const getEnergyOptimization = useCallback(async (fleetId?: string) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      return await api.getEnergyOptimization(fleetId);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to get energy optimization');
      }
      throw err;
    }
  }, [token]);

  // Advanced IoT methods
  const getIoTDashboard = useCallback(async () => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      return await api.getIoTDashboard();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to get IoT dashboard');
      }
      throw err;
    }
  }, [token]);

  const getEquipmentMonitoring = useCallback(async (equipmentId: string) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      return await api.getEquipmentMonitoring(equipmentId);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to get equipment monitoring');
      }
      throw err;
    }
  }, [token]);

  const getEnvironmentalMonitoring = useCallback(async () => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      return await api.getEnvironmentalMonitoring();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to get environmental monitoring');
      }
      throw err;
    }
  }, [token]);

  const getSafetyMonitoring = useCallback(async () => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      return await api.getSafetyMonitoring();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to get safety monitoring');
      }
      throw err;
    }
  }, [token]);

  const createIoTAlert = useCallback(async (alertData: Partial<IoTAlert>) => {
    try {
      const newAlert = await api.createIoTAlert(alertData);
      setAlerts(prev => [...prev, newAlert]);
      return newAlert;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create IoT alert');
      }
      throw err;
    }
  }, []);

  return {
    devices,
    fleets,
    analytics,
    alerts,
    loading,
    error,
    createFleet,
    registerDevice,
    ingestData,
    getFleetAnalytics,
    getPredictiveMaintenance,
    configureAlerts,
    getDevicePerformance,
    getEnergyOptimization,
    getIoTDashboard,
    getEquipmentMonitoring,
    getEnvironmentalMonitoring,
    getSafetyMonitoring,
    createIoTAlert,
  };
}
