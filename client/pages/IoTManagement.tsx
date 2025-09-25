import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wifi, 
  Battery, 
  Signal, 
  Thermometer, 
  Droplets, 
  Wind, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Plus,
  MapPin,
  Gauge,
  Zap,
  Shield,
  Eye
} from 'lucide-react';

interface IoTDevice {
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

interface DeviceFleet {
  id: string;
  name: string;
  devices: IoTDevice[];
  totalDevices: number;
  onlineDevices: number;
  averageBatteryLevel: number;
  criticalAlerts: number;
  lastUpdated: string;
}

const IoTManagement: React.FC = () => {
  const [devices, setDevices] = useState<IoTDevice[]>([]);

  const [fleets, setFleets] = useState<DeviceFleet[]>([
    {
      id: 'fleet_001',
      name: 'Construction Site Alpha',
      devices: devices.slice(0, 3),
      totalDevices: 3,
      onlineDevices: 3,
      averageBatteryLevel: 89,
      criticalAlerts: 1,
      lastUpdated: '1 minute ago'
    },
    {
      id: 'fleet_002',
      name: 'Building A Sensors',
      devices: devices.slice(1, 2),
      totalDevices: 1,
      onlineDevices: 1,
      averageBatteryLevel: 0,
      criticalAlerts: 1,
      lastUpdated: '2 minutes ago'
    }
  ]);

  const [selectedDevice, setSelectedDevice] = useState<IoTDevice | null>(null);
  const [newDevice, setNewDevice] = useState({
    name: '',
    type: 'sensor' as const,
    location: { lat: 0, lon: 0, zone: '' }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'maintenance': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'sensor': return <Activity className="h-5 w-5" />;
      case 'camera': return <Eye className="h-5 w-5" />;
      case 'equipment': return <Gauge className="h-5 w-5" />;
      case 'wearable': return <Shield className="h-5 w-5" />;
      case 'environmental': return <Wind className="h-5 w-5" />;
      default: return <Wifi className="h-5 w-5" />;
    }
  };

  const handleAddDevice = () => {
    const device: IoTDevice = {
      id: `device_${Date.now()}`,
      name: newDevice.name,
      type: newDevice.type,
      status: 'online',
      batteryLevel: Math.floor(Math.random() * 100),
      signalStrength: Math.floor(Math.random() * 100),
      location: newDevice.location,
      lastSeen: 'Just now',
      firmwareVersion: '2.1.0',
      data: {},
      alerts: 0
    };

    setDevices([...devices, device]);
    setNewDevice({ name: '', type: 'sensor', location: { lat: 0, lon: 0, zone: '' } });
  };

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'text-green-500';
    if (level > 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSignalColor = (strength: number) => {
    if (strength > 80) return 'text-green-500';
    if (strength > 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Wifi className="h-8 w-8 text-blue-600" />
            IoT Device Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage your IoT device fleet across construction sites
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Device
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Devices</p>
                <p className="text-2xl font-bold">{devices.length}</p>
              </div>
              <Wifi className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Online Devices</p>
                <p className="text-2xl font-bold text-green-600">
                  {devices.filter(d => d.status === 'online').length}
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
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold text-red-600">
                  {devices.reduce((sum, d) => sum + d.alerts, 0)}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Battery</p>
                <p className="text-2xl font-bold">
                  {Math.round(devices.reduce((sum, d) => sum + d.batteryLevel, 0) / devices.length)}%
                </p>
              </div>
              <Battery className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="devices" className="space-y-6">
        <TabsList>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="fleets">Device Fleets</TabsTrigger>
          <TabsTrigger value="monitoring">Real-time Monitoring</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-6">
          {/* Add New Device */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Device</CardTitle>
              <CardDescription>
                Register a new IoT device to your network
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="device-name">Device Name</Label>
                  <Input
                    id="device-name"
                    value={newDevice.name}
                    onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                    placeholder="Enter device name"
                  />
                </div>
                <div>
                  <Label htmlFor="device-type">Device Type</Label>
                  <Select 
                    value={newDevice.type} 
                    onValueChange={(value: any) => setNewDevice({ ...newDevice, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select device type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sensor">Sensor</SelectItem>
                      <SelectItem value="camera">Camera</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="wearable">Wearable</SelectItem>
                      <SelectItem value="environmental">Environmental</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="device-zone">Location Zone</Label>
                  <Input
                    id="device-zone"
                    value={newDevice.location.zone}
                    onChange={(e) => setNewDevice({ 
                      ...newDevice, 
                      location: { ...newDevice.location, zone: e.target.value }
                    })}
                    placeholder="Enter location zone"
                  />
                </div>
              </div>
              <Button onClick={handleAddDevice} disabled={!newDevice.name || !newDevice.location.zone}>
                Add Device
              </Button>
            </CardContent>
          </Card>

          {/* Devices List */}
          <div className="grid gap-4">
            {devices.map((device) => (
              <Card key={device.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(device.type)}
                      <div>
                        <h3 className="font-semibold">{device.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {device.location.zone} • Last seen: {device.lastSeen}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(device.status)}>
                        {device.status}
                      </Badge>
                      {getStatusIcon(device.status)}
                      {device.alerts > 0 && (
                        <Badge variant="destructive">
                          {device.alerts} Alert{device.alerts > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Battery className={`h-4 w-4 ${getBatteryColor(device.batteryLevel)}`} />
                      <div>
                        <p className="text-xs text-muted-foreground">Battery</p>
                        <p className={`text-sm font-medium ${getBatteryColor(device.batteryLevel)}`}>
                          {device.batteryLevel}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Signal className={`h-4 w-4 ${getSignalColor(device.signalStrength)}`} />
                      <div>
                        <p className="text-xs text-muted-foreground">Signal</p>
                        <p className={`text-sm font-medium ${getSignalColor(device.signalStrength)}`}>
                          {device.signalStrength}%
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Firmware</p>
                      <p className="text-sm font-medium">v{device.firmwareVersion}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="text-sm font-medium capitalize">{device.type}</p>
                    </div>
                  </div>

                  {/* Device Data */}
                  {Object.keys(device.data).length > 0 && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-2">Current Data:</p>
                      <div className="flex flex-wrap gap-4">
                        {device.data.temperature && (
                          <div className="flex items-center gap-1">
                            <Thermometer className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">{device.data.temperature}°F</span>
                          </div>
                        )}
                        {device.data.humidity && (
                          <div className="flex items-center gap-1">
                            <Droplets className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">{device.data.humidity}%</span>
                          </div>
                        )}
                        {device.data.utilization && (
                          <div className="flex items-center gap-1">
                            <Gauge className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{device.data.utilization}%</span>
                          </div>
                        )}
                        {device.data.vibration && (
                          <div className="flex items-center gap-1">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{device.data.vibration.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                    <Button size="sm" variant="outline">
                      <MapPin className="h-3 w-3 mr-1" />
                      Location
                    </Button>
                    <Button size="sm" variant="outline">
                      <Activity className="h-3 w-3 mr-1" />
                      Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="fleets" className="space-y-6">
          <div className="grid gap-4">
            {fleets.map((fleet) => (
              <Card key={fleet.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{fleet.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Last updated: {fleet.lastUpdated}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {fleet.onlineDevices}/{fleet.totalDevices} Online
                      </Badge>
                      {fleet.criticalAlerts > 0 && (
                        <Badge variant="destructive">
                          {fleet.criticalAlerts} Critical
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Devices</p>
                      <p className="text-lg font-semibold">{fleet.totalDevices}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Battery</p>
                      <p className="text-lg font-semibold">{fleet.averageBatteryLevel}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Critical Alerts</p>
                      <p className="text-lg font-semibold text-red-600">{fleet.criticalAlerts}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      View Devices
                    </Button>
                    <Button size="sm" variant="outline">
                      Fleet Settings
                    </Button>
                    <Button size="sm">
                      Manage Fleet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Alert>
            <Activity className="h-4 w-4" />
            <AlertDescription>
              Real-time monitoring dashboard shows live data from all connected IoT devices. 
              Data is updated every 30 seconds.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {devices.map((device) => (
                    <div key={device.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(device.status)}
                        <span className="text-sm">{device.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-16">
                          <Progress value={device.batteryLevel} className="h-2" />
                        </div>
                        <span className="text-xs text-muted-foreground w-12">
                          {device.lastSeen}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Environmental Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <Thermometer className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">72°F</p>
                    <p className="text-xs text-muted-foreground">Temperature</p>
                  </div>
                  <div className="text-center">
                    <Droplets className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">65%</p>
                    <p className="text-xs text-muted-foreground">Humidity</p>
                  </div>
                  <div className="text-center">
                    <Wind className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">8 mph</p>
                    <p className="text-xs text-muted-foreground">Wind Speed</p>
                  </div>
                  <div className="text-center">
                    <Gauge className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">1013</p>
                    <p className="text-xs text-muted-foreground">Pressure</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>IoT Analytics Dashboard</CardTitle>
              <CardDescription>
                Insights and analytics from your IoT device network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">98.5%</div>
                  <p className="text-sm text-muted-foreground">Network Uptime</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">2.3s</div>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">1.2TB</div>
                  <p className="text-sm text-muted-foreground">Data Collected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IoTManagement;
