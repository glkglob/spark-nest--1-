import { RequestHandler } from "express";
import { z } from "zod";
import { authenticateToken } from "./auth";

// Validation schemas
const iotDeviceSchema = z.object({
  deviceId: z.string().min(1),
  deviceType: z.enum(['sensor', 'camera', 'equipment', 'wearable', 'environmental'] as const),
  location: z.object({
    lat: z.number(),
    lon: z.number(),
    zone: z.string().optional()
  }),
  capabilities: z.array(z.string()),
  status: z.enum(['active', 'inactive', 'maintenance', 'error'] as const).default('active')
});

const iotDataSchema = z.object({
  deviceId: z.string(),
  timestamp: z.string().datetime(),
  data: z.record(z.string(), z.any()),
  quality: z.number().min(0).max(1).default(1)
});

const iotAlertSchema = z.object({
  deviceId: z.string(),
  alertType: z.enum(['safety', 'equipment', 'environmental', 'security', 'maintenance'] as const),
  severity: z.enum(['low', 'medium', 'high', 'critical'] as const),
  message: z.string(),
  location: z.object({
    lat: z.number(),
    lon: z.number()
  }),
  metadata: z.record(z.string(), z.any()).optional()
});

// IoT Device Management
export const handleRegisterIoTDevice: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    const validation = iotDeviceSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        errors: validation.error.issues.map(err => ({
          message: err.message,
          field: err.path.join('.')
        }))
      });
    }

    const deviceData = validation.data;
    
    // Mock IoT device registration
    const device = {
      id: `device_${Date.now()}`,
      userId,
      ...deviceData,
      registeredAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      firmwareVersion: '2.1.3',
      batteryLevel: Math.floor(Math.random() * 100),
      signalStrength: Math.floor(Math.random() * 100)
    };
    
    res.status(201).json({
      device,
      message: 'IoT device registered successfully'
    });

  } catch (error) {
    console.error('IoT device registration error:', error);
    res.status(500).json({ message: 'Device registration failed' });
  }
};

// IoT Data Ingestion
export const handleIoTDataIngestion: RequestHandler = async (req, res) => {
  try {
    const validation = iotDataSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        errors: validation.error.issues.map(err => ({
          message: err.message,
          field: err.path.join('.')
        }))
      });
    }

    const { deviceId, timestamp, data, quality } = validation.data;
    
    // Mock IoT data processing
    const processedData = await processIoTData(deviceId, data, quality);
    
    res.json({
      ingestionId: `data_${Date.now()}`,
      deviceId,
      processed: processedData,
      alerts: processedData.alerts || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('IoT data ingestion error:', error);
    res.status(500).json({ message: 'Data ingestion failed' });
  }
};

// IoT Alerts and Notifications
export const handleIoTAlert: RequestHandler = async (req, res) => {
  try {
    const validation = iotAlertSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        errors: validation.error.issues.map(err => ({
          message: err.message,
          field: err.path.join('.')
        }))
      });
    }

    const alertData = validation.data;
    
    // Mock IoT alert processing
    const alert = {
      id: `alert_${Date.now()}`,
      ...alertData,
      createdAt: new Date().toISOString(),
      status: 'active',
      acknowledged: false,
      escalationLevel: 0
    };
    
    // Process alert based on severity
    await processIoTAlert(alert);
    
    res.status(201).json({
      alert,
      message: 'Alert processed successfully'
    });

  } catch (error) {
    console.error('IoT alert processing error:', error);
    res.status(500).json({ message: 'Alert processing failed' });
  }
};

// Real-time IoT Dashboard
export const handleIoTDashboard: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    const { projectId, timeRange } = req.query;
    
    // Mock IoT dashboard data
    const dashboardData = await generateIoTDashboard(userId, projectId as string, timeRange as string);
    
    res.json({
      projectId: projectId || 'all',
      timeRange: timeRange || '24h',
      devices: dashboardData.devices,
      metrics: dashboardData.metrics,
      alerts: dashboardData.alerts,
      insights: dashboardData.insights,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('IoT dashboard error:', error);
    res.status(500).json({ message: 'Dashboard data failed to load' });
  }
};

// Smart Equipment Monitoring
export const handleEquipmentMonitoring: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    const { equipmentId } = req.params;
    
    // Mock equipment monitoring data
    const equipmentData = await generateEquipmentMonitoring(userId, equipmentId);
    
    res.json({
      equipmentId,
      status: equipmentData.status,
      metrics: equipmentData.metrics,
      maintenance: equipmentData.maintenance,
      utilization: equipmentData.utilization,
      alerts: equipmentData.alerts,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Equipment monitoring error:', error);
    res.status(500).json({ message: 'Equipment monitoring failed' });
  }
};

// Environmental Monitoring
export const handleEnvironmentalMonitoring: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    const { projectId, sensors } = req.query;
    
    // Mock environmental monitoring data
    const envData = await generateEnvironmentalData(userId, projectId as string, sensors as string);
    
    res.json({
      projectId,
      sensors: envData.sensors,
      conditions: envData.conditions,
      alerts: envData.alerts,
      recommendations: envData.recommendations,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Environmental monitoring error:', error);
    res.status(500).json({ message: 'Environmental monitoring failed' });
  }
};

// Smart Safety Monitoring
export const handleSafetyMonitoring: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    const { projectId } = req.query;
    
    // Mock safety monitoring data
    const safetyData = await generateSafetyMonitoring(userId, projectId as string);
    
    res.json({
      projectId,
      safetyScore: safetyData.safetyScore,
      violations: safetyData.violations,
      incidents: safetyData.incidents,
      compliance: safetyData.compliance,
      recommendations: safetyData.recommendations,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Safety monitoring error:', error);
    res.status(500).json({ message: 'Safety monitoring failed' });
  }
};

// Helper functions
async function processIoTData(deviceId: string, data: any, quality: number) {
  // Mock IoT data processing based on device type
  const deviceType = deviceId.includes('sensor') ? 'sensor' : 'equipment';
  
  const processedData = {
    deviceId,
    deviceType,
    quality,
    processedAt: new Date().toISOString(),
    insights: [],
    alerts: []
  };

  // Process based on data type
  if (data.temperature !== undefined) {
    if (data.temperature > 35) {
      processedData.alerts.push({
        type: 'temperature',
        severity: 'high',
        message: 'High temperature detected',
        value: data.temperature
      });
    }
  }

  if (data.vibration !== undefined) {
    if (data.vibration > 0.8) {
      processedData.alerts.push({
        type: 'vibration',
        severity: 'medium',
        message: 'Unusual vibration pattern detected',
        value: data.vibration
      });
    }
  }

  if (data.pressure !== undefined) {
    if (data.pressure < 0.3 || data.pressure > 0.9) {
      processedData.alerts.push({
        type: 'pressure',
        severity: 'high',
        message: 'Pressure outside normal range',
        value: data.pressure
      });
    }
  }

  return processedData;
}

async function processIoTAlert(alert: any) {
  // Mock alert processing logic
  console.log(`Processing IoT alert: ${alert.alertType} - ${alert.severity}`);
  
  // Escalate critical alerts immediately
  if (alert.severity === 'critical') {
    console.log('CRITICAL ALERT: Immediate escalation required');
    // In production, this would trigger immediate notifications
  }
  
  // Log alert for audit trail
  console.log(`Alert logged: ${alert.id}`);
}

async function generateIoTDashboard(userId: string, projectId?: string, timeRange?: string) {
  return {
    devices: [
      {
        id: 'device_001',
        name: 'Concrete Temperature Sensor',
        type: 'sensor',
        status: 'active',
        batteryLevel: 85,
        lastData: '2 minutes ago',
        location: 'Building A, Floor 1'
      },
      {
        id: 'device_002',
        name: 'Crane Load Monitor',
        type: 'equipment',
        status: 'active',
        utilization: 0.75,
        lastData: '1 minute ago',
        location: 'Construction Site'
      },
      {
        id: 'device_003',
        name: 'Worker Safety Wearable',
        type: 'wearable',
        status: 'active',
        batteryLevel: 92,
        lastData: '30 seconds ago',
        location: 'Worker John Doe'
      }
    ],
    metrics: {
      totalDevices: 15,
      activeDevices: 14,
      averageBatteryLevel: 87,
      dataPointsToday: 2847,
      alertsActive: 2
    },
    alerts: [
      {
        id: 'alert_001',
        type: 'safety',
        severity: 'medium',
        message: 'Worker detected in restricted area',
        timestamp: '5 minutes ago',
        deviceId: 'device_003'
      },
      {
        id: 'alert_002',
        type: 'equipment',
        severity: 'low',
        message: 'Crane maintenance due',
        timestamp: '1 hour ago',
        deviceId: 'device_002'
      }
    ],
    insights: [
      {
        type: 'efficiency',
        message: 'Equipment utilization increased by 12% this week',
        impact: 'positive'
      },
      {
        type: 'safety',
        message: 'Safety compliance improved by 8%',
        impact: 'positive'
      },
      {
        type: 'maintenance',
        message: '3 devices require battery replacement',
        impact: 'neutral'
      }
    ]
  };
}

async function generateEquipmentMonitoring(userId: string, equipmentId: string) {
  return {
    status: 'operational',
    metrics: {
      operatingHours: 1247,
      utilization: 0.82,
      efficiency: 0.91,
      fuelLevel: 0.75,
      temperature: 68,
      vibration: 0.3,
      pressure: 0.45
    },
    maintenance: {
      lastService: '2024-01-10',
      nextService: '2024-02-10',
      serviceInterval: 200,
      hoursRemaining: 76,
      issues: []
    },
    utilization: {
      daily: 0.85,
      weekly: 0.82,
      monthly: 0.78,
      peakHours: ['09:00-11:00', '14:00-16:00']
    },
    alerts: [
      {
        type: 'maintenance',
        severity: 'low',
        message: 'Scheduled maintenance in 76 hours',
        timestamp: '2024-01-15T10:30:00Z'
      }
    ]
  };
}

async function generateEnvironmentalData(userId: string, projectId?: string, sensors?: string) {
  return {
    sensors: [
      {
        id: 'env_001',
        type: 'air_quality',
        location: 'Site Entrance',
        readings: {
          pm25: 15,
          pm10: 22,
          co2: 420,
          humidity: 65,
          temperature: 72
        },
        status: 'good'
      },
      {
        id: 'env_002',
        type: 'noise',
        location: 'Construction Zone',
        readings: {
          level: 78,
          peak: 85,
          average: 72
        },
        status: 'moderate'
      },
      {
        id: 'env_003',
        type: 'weather',
        location: 'Site Office',
        readings: {
          temperature: 68,
          humidity: 70,
          windSpeed: 8,
          pressure: 1013,
          precipitation: 0
        },
        status: 'clear'
      }
    ],
    conditions: {
      airQuality: 'good',
      noiseLevel: 'moderate',
      weather: 'favorable',
      visibility: 'excellent'
    },
    alerts: [
      {
        type: 'noise',
        severity: 'medium',
        message: 'Noise levels approaching limit',
        value: 78,
        limit: 80
      }
    ],
    recommendations: [
      'Monitor noise levels during peak hours',
      'Ensure proper ventilation in enclosed areas',
      'Weather conditions favorable for concrete work'
    ]
  };
}

async function generateSafetyMonitoring(userId: string, projectId?: string) {
  return {
    safetyScore: 92,
    violations: [
      {
        type: 'PPE',
        severity: 'low',
        count: 2,
        description: 'Workers not wearing safety glasses',
        location: 'Building A, Floor 2',
        timestamp: '2024-01-15T14:30:00Z'
      }
    ],
    incidents: [],
    compliance: {
      ppe: 0.94,
      procedures: 0.98,
      equipment: 0.96,
      overall: 0.95
    },
    recommendations: [
      'Conduct additional PPE training',
      'Implement daily safety briefings',
      'Increase supervisor presence in high-risk areas'
    ]
  };
}
