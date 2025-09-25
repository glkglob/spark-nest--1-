import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Users,
  FileText,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface Project {
  id: number;
  name: string;
  status: 'active' | 'planning' | 'completed';
  progress: number;
  budget: number;
  spent: number;
  cpi: number;
  spi: number;
  quality_score: number;
  safety_score: number;
  risk_level: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

interface AnalyticsData {
  projects: Project[];
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  totalSpent: number;
  averageProgress: number;
  averageCPI: number;
  averageSPI: number;
  averageQuality: number;
  averageSafety: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  monthlyData: Array<{
    month: string;
    budget: number;
    spent: number;
    projects: number;
  }>;
  progressData: Array<{
    name: string;
    progress: number;
    budget: number;
  }>;
}

export default function Analytics() {
  const { token } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const projects = data.projects || [];
        
        // Calculate analytics
        const analytics = calculateAnalytics(projects);
        setAnalyticsData(analytics);
      } else {
        toast.error('Failed to fetch analytics data');
      }
    } catch (error) {
      toast.error('Error fetching analytics');
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (projects: Project[]): AnalyticsData => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
    
    const averageProgress = totalProjects > 0 ? projects.reduce((sum, p) => sum + p.progress, 0) / totalProjects : 0;
    const averageCPI = totalProjects > 0 ? projects.reduce((sum, p) => sum + p.cpi, 0) / totalProjects : 0;
    const averageSPI = totalProjects > 0 ? projects.reduce((sum, p) => sum + p.spi, 0) / totalProjects : 0;
    const averageQuality = totalProjects > 0 ? projects.reduce((sum, p) => sum + p.quality_score, 0) / totalProjects : 0;
    const averageSafety = totalProjects > 0 ? projects.reduce((sum, p) => sum + p.safety_score, 0) / totalProjects : 0;

    const riskDistribution = {
      low: projects.filter(p => p.risk_level === 'low').length,
      medium: projects.filter(p => p.risk_level === 'medium').length,
      high: projects.filter(p => p.risk_level === 'high').length,
    };

    // Generate monthly data (last 6 months)
    const monthlyData = generateMonthlyData(projects);
    
    // Progress data for charts
    const progressData = projects.map(p => ({
      name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
      progress: p.progress,
      budget: p.budget,
    }));

    return {
      projects,
      totalProjects,
      activeProjects,
      completedProjects,
      totalBudget,
      totalSpent,
      averageProgress,
      averageCPI,
      averageSPI,
      averageQuality,
      averageSafety,
      riskDistribution,
      monthlyData,
      progressData,
    };
  };

  const generateMonthlyData = (projects: Project[]) => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      // Filter projects created in this month
      const monthProjects = projects.filter(p => {
        const projectDate = new Date(p.created_at);
        return projectDate.getFullYear() === date.getFullYear() && 
               projectDate.getMonth() === date.getMonth();
      });
      
      const monthBudget = monthProjects.reduce((sum, p) => sum + p.budget, 0);
      const monthSpent = monthProjects.reduce((sum, p) => sum + p.spent, 0);
      
      months.push({
        month: monthName,
        budget: monthBudget,
        spent: monthSpent,
        projects: monthProjects.length,
      });
    }
    
    return months;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'planning': return '#3b82f6';
      case 'completed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="container py-8 md:py-10">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="container py-8 md:py-10">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Unable to load analytics data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const {
    totalProjects,
    activeProjects,
    completedProjects,
    totalBudget,
    totalSpent,
    averageProgress,
    averageCPI,
    averageSPI,
    averageQuality,
    averageSafety,
    riskDistribution,
    monthlyData,
    progressData,
  } = analyticsData;

  const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="container py-8 md:py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your construction projects
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                {activeProjects} active, {completedProjects} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{totalBudget.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {budgetUtilization.toFixed(1)}% utilized
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageProgress.toFixed(1)}%</div>
              <Progress value={averageProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(averageCPI * averageSPI).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                CPI: {averageCPI.toFixed(2)}, SPI: {averageSPI.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
            <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Project Creation</CardTitle>
                  <CardDescription>Projects created over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="projects" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Project Status Distribution</CardTitle>
                  <CardDescription>Breakdown of project statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Active', value: activeProjects, color: getStatusColor('active') },
                          { name: 'Planning', value: Math.max(0, totalProjects - activeProjects - completedProjects), color: getStatusColor('planning') },
                          { name: 'Completed', value: completedProjects, color: getStatusColor('completed') },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[0, 1, 2].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={[
                            getStatusColor('active'),
                            getStatusColor('planning'),
                            getStatusColor('completed')
                          ][index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Progress Overview</CardTitle>
                <CardDescription>Progress and budget for each project</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="progress" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financials" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Budget vs Spent</CardTitle>
                  <CardDescription>Monthly budget allocation and spending</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="budget" fill="#8884d8" />
                      <Bar dataKey="spent" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quality & Safety Scores</CardTitle>
                  <CardDescription>Average quality and safety metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Quality Score</span>
                      <span>{averageQuality.toFixed(1)}%</span>
                    </div>
                    <Progress value={averageQuality} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Safety Score</span>
                      <span>{averageSafety.toFixed(1)}%</span>
                    </div>
                    <Progress value={averageSafety} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="risks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Risk Level Distribution</CardTitle>
                <CardDescription>Breakdown of project risk levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800 border-green-200">Low Risk</Badge>
                      <span>{riskDistribution.low} projects</span>
                    </div>
                    <div className="w-32">
                      <Progress 
                        value={totalProjects > 0 ? (riskDistribution.low / totalProjects) * 100 : 0} 
                        className="h-2"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium Risk</Badge>
                      <span>{riskDistribution.medium} projects</span>
                    </div>
                    <div className="w-32">
                      <Progress 
                        value={totalProjects > 0 ? (riskDistribution.medium / totalProjects) * 100 : 0} 
                        className="h-2"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-100 text-red-800 border-red-200">High Risk</Badge>
                      <span>{riskDistribution.high} projects</span>
                    </div>
                    <div className="w-32">
                      <Progress 
                        value={totalProjects > 0 ? (riskDistribution.high / totalProjects) * 100 : 0} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
