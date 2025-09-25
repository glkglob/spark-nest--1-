import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Truck, 
  Plus, 
  Settings, 
  MapPin, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Battery,
  Signal,
  Wifi,
  Gauge,
  Shield,
  Eye,
  Wind,
  Zap
} from 'lucide-react';

interface Device {
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
  alerts: number;
}

interface DeviceFleet {
  id: string;
  name: string;
  description: string;
  devices: Device[];
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

interface FleetAnalytics {
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

const DeviceFleetManager: React.FC = () => {
  const [fleets, setFleets] = useState<DeviceFleet[]>([
    {
      id: 'fleet_001',
      name: 'Construction Site Alpha',
      description: 'Main construction site IoT device fleet',
      devices: [
        {
          id: 'device_001',
          name: 'Temperature Sensor Alpha',
          type: 'sensor',
          status: 'online',
          batteryLevel: 85,
          signalStrength: 92,
          location: { lat: 34.0522, lon: -118.2437, zone: 'Building A, Floor 1' },
          lastSeen: '2 minutes ago',
          firmwareVersion: '2.1.3',
          alerts: 0
        },
        {
          id: 'device_002',
          name: 'Crane Load Monitor',
          type: 'equipment',
          status: 'online',
          batteryLevel: 0,
          signalStrength: 88,
          location: { lat: 34.0525, lon: -118.2440, zone: 'Construction Site' },
          lastSeen: '1 minute ago',
          firmwareVersion: '1.8.2',
          alerts: 1
        },
        {
          id: 'device_003',
          name: 'Worker Safety Wearable',
          type: 'wearable',
          status: 'online',
          batteryLevel: 92,
          signalStrength: 95,
          location: { lat: 34.0523, lon: -118.2438, zone: 'Worker John Doe' },
          lastSeen: '30 seconds ago',
          firmwareVersion: '3.0.1',
          alerts: 0
        }
      ],
      totalDevices: 3,
      onlineDevices: 3,
      offlineDevices: 0,
      averageBatteryLevel: 89,
      criticalAlerts: 1,
      lastUpdated: '1 minute ago',
      healthScore: 92,
      location: {
        site: 'Construction Site Alpha',
        coordinates: { lat: 34.0522, lon: -118.2437 }
      }
    },
    {
      id: 'fleet_002',
      name: 'Building A Sensor Network',
      description: 'Environmental monitoring sensors for Building A',
      devices: [
        {
          id: 'device_004',
          name: 'Air Quality Monitor',
          type: 'environmental',
          status: 'offline',
          batteryLevel: 23,
          signalStrength: 45,
          location: { lat: 34.0521, lon: -118.2436, zone: 'Building A, Entrance' },
          lastSeen: '15 minutes ago',
          firmwareVersion: '2.0.5',
          alerts: 2
        }
      ],
      totalDevices: 1,
      onlineDevices: 0,
      offlineDevices: 1,
      averageBatteryLevel: 23,
      criticalAlerts: 2,
      lastUpdated: '15 minutes ago',
      healthScore: 45,
      location: {
        site: 'Building A',
        coordinates: { lat: 34.0521, lon: -118.2436 }
      }
    }
  ]);

  const [analytics, setAnalytics] = useState<FleetAnalytics[]>([
    {
      fleetId: 'fleet_001',
      uptime: 98.5,
      dataTransmission: 2.3,
      maintenanceSchedule: {
        nextMaintenance: '2024-02-15',
        overdueMaintenance: 0,
        completedMaintenance: 12
      },
      performanceMetrics: {
        averageResponseTime: 45,
        errorRate: 0.02,
        dataQuality: 97.8
      }
    },
    {
      fleetId: 'fleet_002',
      uptime: 85.2,
      dataTransmission: 1.8,
      maintenanceSchedule: {
        nextMaintenance: '2024-01-30',
        overdueMaintenance: 1,
        completedMaintenance: 8
      },
      performanceMetrics: {
        averageResponseTime: 120,
        errorRate: 0.15,
        dataQuality: 89.5
      }
    }
  ]);

  const [selectedFleet, setSelectedFleet] = useState<DeviceFleet | null>(null);
  const [newFleet, setNewFleet] = useState({
    name: '',
    description: '',
    site: '',
    lat: 0,
    lon: 0
  });

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'sensor': return <Activity className="h-4 w-4" />;
      case 'camera': return <Eye className="h-4 w-4" />;
      case 'equipment': return <Gauge className="h-4 w-4" />;
      case 'wearable': return <Shield className="h-4 w-4" />;
      case 'environmental': return <Wind className="h-4 w-4" />;
      default: return <Wifi className="h-4 w-4" />;
    }
  };

  const handleCreateFleet = () => {
    const fleet: DeviceFleet = {
      id: `fleet_${Date.now()}`,
      name: newFleet.name,
      description: newFleet.description,
      devices: [],
      totalDevices: 0,
      onlineDevices: 0,
      offlineDevices: 0,
      averageBatteryLevel: 0,
      criticalAlerts: 0,
      lastUpdated: 'Just created',
      healthScore: 100,
      location: {
        site: newFleet.site,
        coordinates: { lat: newFleet.lat, lon: newFleet.lon }
      }
    };

    setFleets([...fleets, fleet]);
    setNewFleet({ name: '', description: '', site: '', lat: 0, lon: 0 });
  };

  const getFleetAnalytics = (fleetId: string) => {
    return analytics.find(a => a.fleetId === fleetId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="h-6 w-6 text-blue-600" />
            Device Fleet Manager
          </h2>
          <p className="text-muted-foreground">
            Manage and monitor IoT device fleets across multiple construction sites
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Fleet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Device Fleet</DialogTitle>
              <DialogDescription>
                Set up a new IoT device fleet for a construction site
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fleet-name">Fleet Name</Label>
                <Input
                  id="fleet-name"
                  value={newFleet.name}
                  onChange={(e) => setNewFleet({ ...newFleet, name: e.target.value })}
                  placeholder="Enter fleet name"
                />
              </div>
              <div>
                <Label htmlFor="fleet-description">Description</Label>
                <Input
                  id="fleet-description"
                  value={newFleet.description}
                  onChange={(e) => setNewFleet({ ...newFleet, description: e.target.value })}
                  placeholder="Enter fleet description"
                />
              </div>
              <div>
                <Label htmlFor="fleet-site">Site Name</Label>
                <Input
                  id="fleet-site"
                  value={newFleet.site}
                  onChange={(e) => setNewFleet({ ...newFleet, site: e.target.value })}
                  placeholder="Enter site name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fleet-lat">Latitude</Label>
                  <Input
                    id="fleet-lat"
                    type="number"
                    step="0.000001"
                    value={newFleet.lat}
                    onChange={(e) => setNewFleet({ ...newFleet, lat: parseFloat(e.target.value) || 0 })}
                    placeholder="34.0522"
                  />
                </div>
                <div>
                  <Label htmlFor="fleet-lon">Longitude</Label>
                  <Input
                    id="fleet-lon"
                    type="number"
                    step="0.000001"
                    value={newFleet.lon}
                    onChange={(e) => setNewFleet({ ...newFleet, lon: parseFloat(e.target.value) || 0 })}
                    placeholder="-118.2437"
                  />
                </div>
              </div>
              <Button onClick={handleCreateFleet} disabled={!newFleet.name || !newFleet.site}>
                Create Fleet
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Fleet Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Fleets</p>
                <p className="text-2xl font-bold">{fleets.length}</p>
              </div>
              <Truck className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Devices</p>
                <p className="text-2xl font-bold">
                  {fleets.reduce((sum, fleet) => sum + fleet.totalDevices, 0)}
                </p>
              </div>
              <Wifi className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Online Devices</p>
                <p className="text-2xl font-bold text-green-600">
                  {fleets.reduce((sum, fleet) => sum + fleet.onlineDevices, 0)}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600">
                  {fleets.reduce((sum, fleet) => sum + fleet.criticalAlerts, 0)}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fleet List */}
      <div className="grid gap-6">
        {fleets.map((fleet) => {
          const fleetAnalytics = getFleetAnalytics(fleet.id);
          return (
            <Card key={fleet.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">{fleet.name}</h3>
                      <p className="text-sm text-muted-foreground">{fleet.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {fleet.location.site} • Last updated: {fleet.lastUpdated}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full ${getHealthScoreBg(fleet.healthScore)}`}>
                      <span className={`text-sm font-medium ${getHealthScoreColor(fleet.healthScore)}`}>
                        Health: {fleet.healthScore}%
                      </span>
                    </div>
                    <Button size="sm" variant="outline">
                      <Settings className="h-3 w-3 mr-1" />
                      Manage
                    </Button>
                  </div>
                </div>

                <Tabs defaultValue="overview" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="devices">Devices</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{fleet.totalDevices}</p>
                        <p className="text-sm text-muted-foreground">Total Devices</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{fleet.onlineDevices}</p>
                        <p className="text-sm text-muted-foreground">Online</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{fleet.offlineDevices}</p>
                        <p className="text-sm text-muted-foreground">Offline</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{fleet.averageBatteryLevel}%</p>
                        <p className="text-sm text-muted-foreground">Avg Battery</p>
                      </div>
                    </div>

                    {fleetAnalytics && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">Uptime</p>
                                <p className="text-xl font-bold">{fleetAnalytics.uptime}%</p>
                              </div>
                              <CheckCircle className="h-6 w-6 text-green-500" />
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">Data Transmission</p>
                                <p className="text-xl font-bold">{fleetAnalytics.dataTransmission}TB</p>
                              </div>
                              <Activity className="h-6 w-6 text-blue-500" />
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground">Response Time</p>
                                <p className="text-xl font-bold">{fleetAnalytics.performanceMetrics.averageResponseTime}ms</p>
                              </div>
                              <Clock className="h-6 w-6 text-purple-500" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="devices" className="space-y-4">
                    <div className="grid gap-3">
                      {fleet.devices.map((device) => (
                        <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getDeviceIcon(device.type)}
                            <div>
                              <p className="font-medium">{device.name}</p>
                              <p className="text-sm text-muted-foreground">{device.location.zone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Battery className="h-4 w-4" />
                              <span className="text-sm">{device.batteryLevel}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Signal className="h-4 w-4" />
                              <span className="text-sm">{device.signalStrength}%</span>
                            </div>
                            <Badge className={getStatusColor(device.status)}>
                              {device.status}
                            </Badge>
                            {device.alerts > 0 && (
                              <Badge variant="destructive">
                                {device.alerts}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="analytics" className="space-y-4">
                    {fleetAnalytics && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Performance Metrics</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm">Average Response Time</span>
                              <span className="font-medium">{fleetAnalytics.performanceMetrics.averageResponseTime}ms</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Error Rate</span>
                              <span className="font-medium">{(fleetAnalytics.performanceMetrics.errorRate * 100).toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Data Quality</span>
                              <span className="font-medium">{fleetAnalytics.performanceMetrics.dataQuality}%</span>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Maintenance Status</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm">Next Maintenance</span>
                              <span className="font-medium">{fleetAnalytics.maintenanceSchedule.nextMaintenance}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Overdue</span>
                              <span className="font-medium text-red-600">{fleetAnalytics.maintenanceSchedule.overdueMaintenance}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Completed</span>
                              <span className="font-medium text-green-600">{fleetAnalytics.maintenanceSchedule.completedMaintenance}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="maintenance" className="space-y-4">
                    <div className="grid gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Maintenance Schedule</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">Routine Inspection</p>
                                <p className="text-sm text-muted-foreground">Monthly device health check</p>
                              </div>
                              <Badge variant="outline">Scheduled</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">Firmware Update</p>
                                <p className="text-sm text-muted-foreground">Update to latest firmware version</p>
                              </div>
                              <Badge variant="destructive">Overdue</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">Battery Replacement</p>
                                <p className="text-sm text-muted-foreground">Replace low battery devices</p>
                              </div>
                              <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DeviceFleetManager;
