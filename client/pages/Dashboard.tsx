import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Thermometer, CloudSun, CloudRain, Hammer, Users, AlertTriangle, PhoneCall, Mail, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { useProjects, type Project } from "@/hooks/use-projects";
import { useUserData } from "@/hooks/use-user-data";
import { useWeather } from "@/hooks/use-weather";
import { useNotifications } from "@/hooks/use-notifications";
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const { user } = useAuth();
  const { projects, loading: projectsLoading, error: projectsError } = useProjects();
  const { userData, statistics, loading: userLoading, error: userError, getUserData, getUserStatistics } = useUserData();
  const { current: weatherCurrent, forecast: weatherForecast, loading: weatherLoading, error: weatherError, getWeather } = useWeather();
  const { notifications, unreadCount } = useNotifications();
  
  const [projectId, setProjectId] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Initialize data on mount
  useEffect(() => {
    if (user) {
      getUserData();
      getUserStatistics();
      getWeather();
    }
  }, [user, getUserData, getUserStatistics, getWeather]);

  // Set initial project when projects are loaded
  useEffect(() => {
    if (projects.length > 0 && !projectId) {
      setProjectId(projects[0].id);
      setSelectedProject(projects[0]);
    }
  }, [projects, projectId]);

  // Update selected project when projectId changes
  useEffect(() => {
    if (projectId && projects.length > 0) {
      const foundProject = projects.find(p => p.id === projectId);
      setSelectedProject(foundProject || null);
    }
  }, [projectId, projects]);

  const project = selectedProject;

  // Generate cost performance data based on project data
  const costPerfData = useMemo(() => {
    if (!project) return [];
    
    const weeks = Math.ceil(project.progress / 20); // Approximate weeks based on progress
    const data = [];
    
    for (let i = 1; i <= Math.max(weeks, 4); i++) {
      const weekProgress = Math.min((i / Math.max(weeks, 4)) * 100, project.progress);
      const PV = (weekProgress / 100) * project.budget;
      const EV = PV * 0.95; // Slightly under budget
      const AC = EV * 1.02; // Slightly over actual cost
      
      data.push({
        name: i === Math.max(weeks, 4) ? "Current" : `Week ${i}`,
        PV: Math.round(PV),
        EV: Math.round(EV),
        AC: Math.round(AC)
      });
    }
    
    return data;
  }, [project]);

  // Generate ABC analysis data based on project materials
  const abccData = useMemo(() => {
    if (!project || !project.materials) {
      return [
        { name: "Labor", value: 328000 },
        { name: "Materials", value: 284000 },
        { name: "Equipment", value: 156000 },
        { name: "Overhead", value: 127500 },
      ];
    }
    
    const materialCost = project.materials.reduce((sum, material) => sum + (material.cost || 0), 0);
    const laborCost = Math.round(project.spent * 0.4);
    const equipmentCost = Math.round(project.spent * 0.2);
    const overheadCost = Math.round(project.spent * 0.15);
    
    return [
      { name: "Labor", value: laborCost },
      { name: "Materials", value: materialCost },
      { name: "Equipment", value: equipmentCost },
      { name: "Overhead", value: overheadCost },
    ];
  }, [project]);

  const abccColors = ["hsl(var(--primary))", "hsl(var(--accent))", "#B4413C", "#ECEBD5"]; // brand aligned

  // Loading state
  if (projectsLoading || userLoading) {
    return (
      <div className="container py-8 md:py-10 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (projectsError || userError) {
    return (
      <div className="container py-8 md:py-10 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <div>
            <h3 className="text-lg font-semibold">Error Loading Dashboard</h3>
            <p className="text-muted-foreground">
              {projectsError || userError || 'Failed to load dashboard data'}
            </p>
          </div>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // No projects state
  if (!project && projects.length === 0) {
    return (
      <div className="container py-8 md:py-10 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <Hammer className="h-8 w-8 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">No Projects Found</h3>
            <p className="text-muted-foreground">
              Create your first project to get started with the dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) return null;

  const budgetUsedPct = Math.min(100, Math.round((project.spent / project.budget) * 100));

  return (
    <div className="container py-8 md:py-10 space-y-8 animate-in fade-in">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-primary/10 text-primary border-primary/20 hover-scale animate-in bounce-in">Active project</Badge>
            <h1 className="text-3xl font-bold tracking-tight text-balance">{project.name}</h1>
          </div>
          <p className="text-base text-muted-foreground text-pretty">Budget £{project.budget.toLocaleString()} • Spent £{project.spent.toLocaleString()} • Status {project.status}</p>
        </div>

        <div className="flex items-center gap-4 animate-in slide-up" style={{ animationDelay: '200ms' }}>
          <Select value={projectId} onValueChange={(v) => setProjectId(v)}>
            <SelectTrigger className="w-[280px] h-11 focus-ring"><SelectValue placeholder="Select project" /></SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="secondary" size="lg" onClick={() => window.location.reload()} className="hover-lift">Refresh</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <KpiCard title="Overall progress" value={`${project.progress}%`} className="animate-in slide-up" style={{ animationDelay: '300ms' }}>
          <Progress value={project.progress} className="h-2" />
        </KpiCard>
        <KpiCard title="Budget used" value={`${budgetUsedPct}%`} className="animate-in slide-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            £{project.spent.toLocaleString()} of £{project.budget.toLocaleString()}
          </div>
        </KpiCard>
        <KpiCard title="Performance" value={`Progress ${project.progress}%`} icon={project.progress >= 75 ? <TrendingUp className="h-4 w-4 text-emerald-600"/> : <TrendingDown className="h-4 w-4 text-destructive"/>} className="animate-in slide-up" style={{ animationDelay: '500ms' }} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 card-interactive animate-in slide-up" style={{ animationDelay: '600ms' }}>
          <CardHeader>
            <CardTitle className="text-xl">Cost Performance (EVM)</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedCostPerformance data={costPerfData} />
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-interactive animate-in slide-up" style={{ animationDelay: '700ms' }}>
          <CardHeader>
            <CardTitle className="text-xl">ABCC Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={abccData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                  {abccData.map((_, i) => (
                    <Cell key={i} fill={abccColors[i % abccColors.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(v: number) => `£${(v/1000).toFixed(0)}k`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <CardHeader><CardTitle>Materials status</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {project.materials && project.materials.length > 0 ? (
                project.materials.map(m => (
                  <div key={m.id} className="rounded-xl border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{m.name}</div>
                        <div className="text-xs text-muted-foreground">{m.quantity || 0} {m.unit || 'units'}</div>
                      </div>
                      <Badge className={m.status === 'used' ? 'bg-destructive text-destructive-foreground' : m.status === 'ordered' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}>
                        {m.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No materials found for this project
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Project Overview</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {statistics ? (
                <>
                  <div className="flex items-center gap-3 rounded-xl border p-4">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium">Total Projects</div>
                      <div className="truncate text-xs text-muted-foreground">{statistics.projects.total} projects</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border p-4">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 font-semibold">
                      <Hammer className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium">Active Projects</div>
                      <div className="truncate text-xs text-muted-foreground">{statistics.projects.active} active</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border p-4">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 font-semibold">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium">Notifications</div>
                      <div className="truncate text-xs text-muted-foreground">{unreadCount} unread</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  Loading project statistics...
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Thermometer className="h-4 w-4"/> Site weather</CardTitle></CardHeader>
            <CardContent>
              {weatherLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : weatherError ? (
                <div className="text-center py-4 text-muted-foreground">
                  <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
                  <p>Weather data unavailable</p>
                </div>
              ) : weatherCurrent ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold">{weatherCurrent.temperature}°C</div>
                      <div className="text-sm text-muted-foreground">{weatherCurrent.condition}</div>
                    </div>
                    <WeatherIcon condition={weatherCurrent.condition} />
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {weatherForecast.map((f, i) => (
                      <div key={i} className="rounded-lg border p-2 text-center">
                        <div className="text-xs text-muted-foreground">{f.day}</div>
                        <div className="font-medium">{f.high}°/{f.low}°</div>
                        <div className="mx-auto mt-1"><WeatherIcon condition={f.condition} small/></div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No weather data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="h-4 w-4"/> Recent Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {notifications.length > 0 ? (
                notifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3 rounded-lg border p-3">
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary font-semibold">
                      {notification.type === 'success' ? '✓' : notification.type === 'warning' ? '⚠' : notification.type === 'error' ? '✕' : 'i'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm"><span className="font-medium">{notification.title}</span> · <span className="text-muted-foreground">{new Date(notification.timestamp).toLocaleDateString()}</span></div>
                      <div className="text-sm text-muted-foreground">{notification.message}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No recent notifications
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button variant="secondary" className="w-full"><PhoneCall className="mr-2 h-4 w-4"/> System Health</Button>
                <Button className="w-full"><Mail className="mr-2 h-4 w-4"/> {unreadCount} Unread</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-4 w-4"/> User Profile</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {userData ? (
                <>
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <Badge className="capitalize">{userData.user.role}</Badge>
                      <div className="font-medium">{userData.user.name}</div>
                      <div className="ml-auto text-xs text-muted-foreground">{userData.user.isActive ? 'Active' : 'Inactive'}</div>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">Email: {userData.user.email}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Projects</Badge>
                      <div className="font-medium">Total: {statistics?.projects.total || 0}</div>
                      <div className="ml-auto text-xs text-muted-foreground">Active: {statistics?.projects.active || 0}</div>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">Completed: {statistics?.projects.completed || 0}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Activity</Badge>
                      <div className="font-medium">This Week: {statistics?.activity.thisWeek || 0}</div>
                      <div className="ml-auto text-xs text-muted-foreground">This Month: {statistics?.activity.thisMonth || 0}</div>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">Last Login: {new Date(userData.user.lastLoginAt || userData.user.createdAt).toLocaleDateString()}</div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  Loading user profile...
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function WeatherIcon({ condition, small }: { condition: string; small?: boolean }) {
  const size = small ? "h-4 w-4" : "h-8 w-8";
  if (/sun|clear/i.test(condition)) return <CloudSun className={size} />;
  if (/rain/i.test(condition)) return <CloudRain className={size} />;
  return <CloudSun className={size} />;
}

function KpiCard({ title, value, icon, children, className, style }: { title: string; value: string; icon?: React.ReactNode; children?: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <Card className={cn("card-interactive", className)} style={style}>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-2xl font-semibold">
          {icon}
          <span>{value}</span>
        </div>
        {children && <div className="mt-3">{children}</div>}
      </CardContent>
    </Card>
  );
}

function ComposedCostPerformance({ data }: { data: { name: string; PV: number; EV: number; AC: number }[] }) {
  return (
    <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis tickFormatter={(v) => `£${v / 1000}k`} />
      <Tooltip formatter={(v: number) => `£${(v/1000).toFixed(0)}k`} />
      <Legend />
      <Area type="monotone" dataKey="PV" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" />
      <Area type="monotone" dataKey="EV" stroke="#FFC185" fill="rgba(255,193,133,0.2)" />
      <Line type="monotone" dataKey="AC" stroke="#B4413C" strokeWidth={2} dot={false} />
    </LineChart>
  );
}
