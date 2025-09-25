import { RequestHandler } from "express";
import { z } from "zod";
import { authenticateToken } from "./auth";

// Validation schemas
const deviceRegistrationSchema = z.object({
  name: z.string().min(1, "Device name is required"),
  type: z.enum(['sensor', 'camera', 'equipment', 'wearable', 'environmental'] as const),
  location: z.object({
    lat: z.number(),
    lon: z.number(),
    zone: z.string().optional()
  }),
  capabilities: z.array(z.string()).optional(),
  firmwareVersion: z.string().optional(),
  configuration: z.record(z.string(), z.any()).optional()
});

const fleetManagementSchema = z.object({
  name: z.string().min(1, "Fleet name is required"),
  description: z.string().optional(),
  location: z.object({
    site: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lon: z.number()
    })
  }),
  deviceIds: z.array(z.string()).optional(),
  settings: z.record(z.string(), z.any()).optional()
});

const dataIngestionSchema = z.object({
  deviceId: z.string().min(1, "Device ID is required"),
  timestamp: z.string().datetime(),
  data: z.record(z.string(), z.any()),
  quality: z.number().min(0).max(1).default(1),
  metadata: z.record(z.string(), z.any()).optional()
});

const alertConfigurationSchema = z.object({
  deviceId: z.string().optional(),
  fleetId: z.string().optional(),
  alertType: z.enum(['battery_low', 'signal_weak', 'temperature_high', 'maintenance_due', 'offline'] as const),
  threshold: z.number().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical'] as const),
  enabled: z.boolean().default(true),
  notificationChannels: z.array(z.enum(['email', 'sms', 'push', 'webhook'] as const)).optional()
});

// Device Fleet Management
export const handleCreateFleet: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    const validation = fleetManagementSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        errors: validation.error.issues.map(err => ({
          message: err.message,
          field: err.path.join('.')
        }))
      });
    }

    const fleetData = validation.data;
    
    // Mock fleet creation
    const fleet = await createDeviceFleet(userId, fleetData);
    
    res.status(201).json({
      fleet,
      message: 'Device fleet created successfully'
    });

  } catch (error) {
    console.error('Fleet creation error:', error);
    res.status(500).json({ message: 'Fleet creation failed' });
  }
};

// Advanced Device Registration
export const handleRegisterDevice: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    const validation = deviceRegistrationSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        errors: validation.error.issues.map(err => ({
          message: err.message,
          field: err.path.join('.')
        }))
      });
    }

    const deviceData = validation.data;
    
    // Mock device registration
    const device = await registerIoTDevice(userId, deviceData);
    
    res.status(201).json({
      device,
      message: 'IoT device registered successfully'
    });

  } catch (error) {
    console.error('Device registration error:', error);
    res.status(500).json({ message: 'Device registration failed' });
  }
};

// Advanced Data Ingestion
export const handleDataIngestion: RequestHandler = async (req, res) => {
  try {
    const validation = dataIngestionSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        errors: validation.error.issues.map(err => ({
          message: err.message,
          field: err.path.join('.')
        }))
      });
    }

    const { deviceId, timestamp, data, quality, metadata } = validation.data;
    
    // Mock data processing
    const processedData = await processAdvancedIoTData(deviceId, data, quality, metadata);
    
    res.json({
      ingestionId: `data_${Date.now()}`,
      deviceId,
      processed: processedData,
      alerts: processedData.alerts || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Data ingestion error:', error);
    res.status(500).json({ message: 'Data ingestion failed' });
  }
};

// Fleet Analytics
export const handleFleetAnalytics: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    const { fleetId, timeRange } = req.query;
    
    // Mock fleet analytics
    const analytics = await generateFleetAnalytics(userId, fleetId as string, timeRange as string);
    
    res.json({
      fleetId: fleetId || 'all',
      timeRange: timeRange || '24h',
      analytics,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Fleet analytics error:', error);
    res.status(500).json({ message: 'Fleet analytics failed' });
  }
};

// Predictive Maintenance
export const handlePredictiveMaintenance: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    const { fleetId } = req.query;
    
    // Mock predictive maintenance analysis
    const maintenance = await generatePredictiveMaintenance(userId, fleetId as string);
    
    res.json({
      fleetId: fleetId || 'all',
      maintenance,
      recommendations: maintenance.recommendations,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Predictive maintenance error:', error);
    res.status(500).json({ message: 'Predictive maintenance analysis failed' });
  }
};

// Alert Configuration
export const handleConfigureAlerts: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    const validation = alertConfigurationSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        errors: validation.error.issues.map(err => ({
          message: err.message,
          field: err.path.join('.')
        }))
      });
    }

    const alertConfig = validation.data;
    
    // Mock alert configuration
    const configuration = await configureIoTAlerts(userId, alertConfig);
    
    res.status(201).json({
      configuration,
      message: 'Alert configuration updated successfully'
    });

  } catch (error) {
    console.error('Alert configuration error:', error);
    res.status(500).json({ message: 'Alert configuration failed' });
  }
};

// Device Performance Monitoring
export const handleDevicePerformance: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    const { deviceId, metrics } = req.query;
    
    // Mock device performance monitoring
    const performance = await monitorDevicePerformance(userId, deviceId as string, metrics as string);
    
    res.json({
      deviceId,
      metrics: metrics || 'all',
      performance,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Device performance monitoring error:', error);
    res.status(500).json({ message: 'Device performance monitoring failed' });
  }
};

// Energy Optimization
export const handleEnergyOptimization: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    const { fleetId } = req.query;
    
    // Mock energy optimization analysis
    const optimization = await optimizeEnergyConsumption(userId, fleetId as string);
    
    res.json({
      fleetId: fleetId || 'all',
      optimization,
      savings: optimization.savings,
      recommendations: optimization.recommendations,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Energy optimization error:', error);
    res.status(500).json({ message: 'Energy optimization analysis failed' });
  }
};

// Helper functions
async function createDeviceFleet(userId: string, fleetData: any) {
  const fleet = {
    id: `fleet_${Date.now()}`,
    userId,
    ...fleetData,
    devices: [],
    totalDevices: 0,
    onlineDevices: 0,
    offlineDevices: 0,
    averageBatteryLevel: 0,
    criticalAlerts: 0,
    healthScore: 100,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };

  console.log(`Creating device fleet ${fleet.id} for user ${userId}`);
  
  return fleet;
}

async function registerIoTDevice(userId: string, deviceData: any) {
  const device = {
    id: `device_${Date.now()}`,
    userId,
    ...deviceData,
    status: 'online',
    batteryLevel: Math.floor(Math.random() * 100),
    signalStrength: Math.floor(Math.random() * 100),
    lastSeen: new Date().toISOString(),
    firmwareVersion: deviceData.firmwareVersion || '2.1.0',
    registeredAt: new Date().toISOString(),
    alerts: 0,
    data: {}
  };

  console.log(`Registering IoT device ${device.id} for user ${userId}`);
  
  return device;
}

async function processAdvancedIoTData(deviceId: string, data: any, quality: number, metadata: any) {
  const processedData = {
    deviceId,
    quality,
    processedAt: new Date().toISOString(),
    insights: [],
    alerts: [],
    anomalies: []
  };

  // Process different data types
  if (data.temperature !== undefined) {
    if (data.temperature > 35) {
      processedData.alerts.push({
        type: 'temperature',
        severity: 'high',
        message: 'High temperature detected',
        value: data.temperature,
        threshold: 35
      });
    }
    if (data.temperature < 0) {
      processedData.anomalies.push({
        type: 'temperature',
        severity: 'critical',
        message: 'Extremely low temperature detected',
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
        value: data.vibration,
        threshold: 0.8
      });
    }
  }

  if (data.batteryLevel !== undefined && data.batteryLevel < 20) {
    processedData.alerts.push({
      type: 'battery',
      severity: 'high',
      message: 'Low battery level',
      value: data.batteryLevel,
      threshold: 20
    });
  }

  if (data.signalStrength !== undefined && data.signalStrength < 30) {
    processedData.alerts.push({
      type: 'signal',
      severity: 'medium',
      message: 'Weak signal strength',
      value: data.signalStrength,
      threshold: 30
    });
  }

  return processedData;
}

async function generateFleetAnalytics(userId: string, fleetId?: string, timeRange?: string) {
  return {
    fleetId: fleetId || 'all',
    timeRange: timeRange || '24h',
    metrics: {
      totalDevices: 15,
      onlineDevices: 14,
      offlineDevices: 1,
      averageBatteryLevel: 87,
      averageSignalStrength: 85,
      dataTransmission: 2.3,
      uptime: 98.5,
      errorRate: 0.02
    },
    performance: {
      averageResponseTime: 45,
      dataQuality: 97.8,
      energyEfficiency: 92.3,
      maintenanceScore: 89.1
    },
    trends: {
      batteryDecline: -2.3,
      signalImprovement: 5.7,
      dataIncrease: 12.4,
      errorReduction: -15.2
    },
    insights: [
      {
        type: 'performance',
        message: 'Fleet performance improved by 8% this week',
        impact: 'positive'
      },
      {
        type: 'maintenance',
        message: '3 devices require battery replacement',
        impact: 'neutral'
      },
      {
        type: 'energy',
        message: 'Energy consumption reduced by 12%',
        impact: 'positive'
      }
    ]
  };
}

async function generatePredictiveMaintenance(userId: string, fleetId?: string) {
  return {
    fleetId: fleetId || 'all',
    analysis: {
      totalDevices: 15,
      maintenanceRequired: 3,
      criticalMaintenance: 1,
      preventiveMaintenance: 2,
      maintenanceScore: 87
    },
    predictions: [
      {
        deviceId: 'device_002',
        deviceName: 'Crane Load Monitor',
        prediction: 'Battery replacement needed in 7 days',
        confidence: 0.92,
        severity: 'medium',
        estimatedCost: 150,
        recommendedAction: 'Schedule battery replacement during low-usage period'
      },
      {
        deviceId: 'device_004',
        deviceName: 'Air Quality Monitor',
        prediction: 'Firmware update required in 14 days',
        confidence: 0.88,
        severity: 'low',
        estimatedCost: 0,
        recommendedAction: 'Schedule firmware update during maintenance window'
      },
      {
        deviceId: 'device_001',
        deviceName: 'Temperature Sensor Alpha',
        prediction: 'Calibration needed in 21 days',
        confidence: 0.85,
        severity: 'low',
        estimatedCost: 75,
        recommendedAction: 'Schedule calibration with certified technician'
      }
    ],
    recommendations: [
      'Implement proactive maintenance scheduling',
      'Increase monitoring frequency for critical devices',
      'Consider upgrading aging devices',
      'Optimize battery usage patterns'
    ],
    costOptimization: {
      potentialSavings: 2500,
      maintenanceEfficiency: 0.15,
      downtimeReduction: 0.25
    }
  };
}

async function configureIoTAlerts(userId: string, alertConfig: any) {
  const configuration = {
    id: `alert_config_${Date.now()}`,
    userId,
    ...alertConfig,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    status: 'active'
  };

  console.log(`Configuring IoT alerts for user ${userId}:`, alertConfig);
  
  return configuration;
}

async function monitorDevicePerformance(userId: string, deviceId: string, metrics: string) {
  return {
    deviceId,
    metrics: metrics || 'all',
    performance: {
      uptime: 98.7,
      responseTime: 45,
      dataQuality: 97.2,
      energyConsumption: 2.3,
      errorRate: 0.01,
      throughput: 1250
    },
    trends: {
      responseTime: { current: 45, previous: 52, change: -13.5 },
      uptime: { current: 98.7, previous: 97.1, change: 1.6 },
      energyConsumption: { current: 2.3, previous: 2.8, change: -17.9 }
    },
    benchmarks: {
      industryAverage: {
        uptime: 95.0,
        responseTime: 60,
        energyConsumption: 3.2
      },
      performance: 'above_average'
    },
    recommendations: [
      'Device performing above industry standards',
      'Consider optimizing data transmission frequency',
      'Monitor battery usage patterns'
    ]
  };
}

async function optimizeEnergyConsumption(userId: string, fleetId?: string) {
  return {
    fleetId: fleetId || 'all',
    currentConsumption: {
      totalPower: 2.5, // kW
      dailyCost: 45.2,
      monthlyCost: 1356,
      carbonFootprint: 1.2 // tons CO2/month
    },
    optimization: {
      potentialReduction: 0.4, // kW
      costSavings: 216, // monthly
      carbonReduction: 0.2, // tons CO2/month
      paybackPeriod: 8.5 // months
    },
    recommendations: [
      {
        action: 'Implement sleep mode for idle sensors',
        impact: 'Reduce power consumption by 25%',
        cost: 0,
        savings: 54
      },
      {
        action: 'Upgrade to energy-efficient devices',
        impact: 'Reduce power consumption by 35%',
        cost: 1200,
        savings: 76
      },
      {
        action: 'Optimize data transmission frequency',
        impact: 'Reduce power consumption by 15%',
        cost: 0,
        savings: 32
      },
      {
        action: 'Install solar panels for remote devices',
        impact: 'Reduce grid dependency by 80%',
        cost: 2500,
        savings: 89
      }
    ],
    implementation: {
      priority: 'high',
      timeline: '3 months',
      resources: ['energy engineer', 'IoT technician'],
      estimatedROI: 2.8
    }
  };
}
