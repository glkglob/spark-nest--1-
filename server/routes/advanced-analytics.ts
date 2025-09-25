import { RequestHandler } from "express";
import { z } from "zod";
import { authenticateToken } from "./auth";
import { ProjectsService } from "../lib/projects-service";

// Validation schemas
const analyticsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  projectId: z.string().optional(),
  granularity: z.enum(['daily', 'weekly', 'monthly', 'yearly']).default('monthly'),
  metrics: z.array(z.enum(['progress', 'budget', 'quality', 'safety', 'timeline'])).default(['progress', 'budget'])
});

const reportSchema = z.object({
  type: z.enum(['project_summary', 'financial_report', 'performance_analysis', 'risk_assessment', 'team_productivity']),
  format: z.enum(['pdf', 'excel', 'csv', 'json']).default('json'),
  includeCharts: z.boolean().default(true),
  filters: z.object({
    dateRange: z.object({
      start: z.string(),
      end: z.string()
    }).optional(),
    projects: z.array(z.string()).optional(),
    teams: z.array(z.string()).optional()
  }).optional()
});

// Advanced Analytics Dashboard
export const handleAdvancedAnalytics: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    const validation = analyticsQuerySchema.safeParse(req.query);
    
    if (!validation.success) {
      return res.status(400).json({
        errors: validation.error.issues.map(err => ({
          message: err.message,
          field: err.path[0] as string,
        }))
      });
    }

    const { startDate, endDate, projectId, granularity, metrics } = validation.data;
    
    // Get user projects
    const projects = await ProjectsService.getUserProjects(userId);
    
    // Filter projects if needed
    const filteredProjects = projectId 
      ? projects.filter(p => p.id.toString() === projectId)
      : projects;

    // Calculate advanced metrics
    const analytics = await calculateAdvancedAnalytics(filteredProjects, {
      startDate,
      endDate,
      granularity,
      metrics
    });

    res.json(analytics);

  } catch (error) {
    console.error('Advanced analytics error:', error);
    res.status(500).json({ message: 'Failed to generate advanced analytics' });
  }
};

// Predictive Analytics
export const handlePredictiveAnalytics: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    const projects = await ProjectsService.getUserProjects(userId);
    
    // Generate predictions
    const predictions = {
      timelinePredictions: await predictProjectTimelines(projects),
      budgetPredictions: await predictBudgetOverruns(projects),
      riskPredictions: await predictRisks(projects),
      resourcePredictions: await predictResourceNeeds(projects),
      qualityPredictions: await predictQualityIssues(projects)
    };

    res.json(predictions);

  } catch (error) {
    console.error('Predictive analytics error:', error);
    res.status(500).json({ message: 'Failed to generate predictions' });
  }
};

// Custom Report Generation
export const handleGenerateReport: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    const validation = reportSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        errors: validation.error.issues.map(err => ({
          message: err.message,
          field: err.path[0] as string,
        }))
      });
    }

    const { type, format, includeCharts, filters } = validation.data;
    
    // Generate report data
    const reportData = await generateReportData(userId, type, filters);
    
    // Format report based on requested format
    const formattedReport = await formatReport(reportData, format, includeCharts);
    
    // Set appropriate headers
    const filename = `${type}_report_${new Date().toISOString().split('T')[0]}`;
    
    switch (format) {
      case 'pdf':
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
        break;
      case 'excel':
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
        break;
      case 'csv':
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
        break;
      default:
        res.setHeader('Content-Type', 'application/json');
    }
    
    res.send(formattedReport);

  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
};

// Benchmarking and Comparison
export const handleBenchmarking: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    const projects = await ProjectsService.getUserProjects(userId);
    
    // Industry benchmarks (mock data - in production, this would come from industry databases)
    const industryBenchmarks = {
      averageProjectDuration: 180, // days
      averageBudgetVariance: 0.15, // 15%
      averageQualityScore: 85,
      averageSafetyScore: 92,
      averageCPI: 1.02,
      averageSPI: 0.98
    };
    
    // Calculate user's performance vs industry benchmarks
    const userPerformance = calculateUserPerformance(projects);
    const comparison = compareToBenchmarks(userPerformance, industryBenchmarks);
    
    res.json({
      userPerformance,
      industryBenchmarks,
      comparison,
      recommendations: generateRecommendations(comparison)
    });

  } catch (error) {
    console.error('Benchmarking error:', error);
    res.status(500).json({ message: 'Failed to generate benchmarking data' });
  }
};

// Real-time Performance Monitoring
export const handlePerformanceMonitoring: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    
    // Real-time metrics
    const realTimeMetrics = {
      activeProjects: await getActiveProjectsCount(userId),
      currentSpend: await getCurrentSpend(userId),
      teamUtilization: await getTeamUtilization(userId),
      riskAlerts: await getActiveRiskAlerts(userId),
      qualityIssues: await getQualityIssues(userId),
      timelineVariances: await getTimelineVariances(userId),
      lastUpdated: new Date().toISOString()
    };
    
    res.json(realTimeMetrics);

  } catch (error) {
    console.error('Performance monitoring error:', error);
    res.status(500).json({ message: 'Failed to get performance metrics' });
  }
};

// Helper functions
async function calculateAdvancedAnalytics(projects: any[], options: any) {
  const { startDate, endDate, granularity, metrics } = options;
  
  // Time series data
  const timeSeriesData = generateTimeSeriesData(projects, granularity);
  
  // Advanced metrics
  const advancedMetrics = {
    portfolioHealth: calculatePortfolioHealth(projects),
    resourceEfficiency: calculateResourceEfficiency(projects),
    costPerformance: calculateCostPerformance(projects),
    schedulePerformance: calculateSchedulePerformance(projects),
    qualityTrends: calculateQualityTrends(projects),
    riskDistribution: calculateRiskDistribution(projects),
    teamProductivity: calculateTeamProductivity(projects),
    clientSatisfaction: calculateClientSatisfaction(projects)
  };
  
  return {
    timeSeriesData,
    advancedMetrics,
    summary: generateAnalyticsSummary(projects),
    insights: generateInsights(projects),
    recommendations: generateRecommendations(advancedMetrics)
  };
}

async function predictProjectTimelines(projects: any[]) {
  // Mock prediction algorithm
  return projects.map(project => ({
    projectId: project.id,
    projectName: project.name,
    currentProgress: project.progress,
    predictedCompletion: new Date(Date.now() + (100 - project.progress) * 24 * 60 * 60 * 1000),
    confidence: 0.85,
    riskFactors: ['weather', 'supply_chain', 'labor_availability']
  }));
}

async function predictBudgetOverruns(projects: any[]) {
  return projects.map(project => ({
    projectId: project.id,
    projectName: project.name,
    currentSpend: project.spent,
    budget: project.budget,
    predictedOverrun: project.budget * 0.12, // 12% overrun prediction
    confidence: 0.78,
    contributingFactors: ['material_cost_increase', 'scope_creep']
  }));
}

async function predictRisks(projects: any[]) {
  return projects.map(project => ({
    projectId: project.id,
    projectName: project.name,
    riskLevel: project.risk_level,
    predictedRisks: [
      { type: 'weather', probability: 0.3, impact: 'medium' },
      { type: 'supply_chain', probability: 0.2, impact: 'high' },
      { type: 'labor_shortage', probability: 0.15, impact: 'medium' }
    ],
    mitigationStrategies: [
      'Implement weather monitoring',
      'Establish backup suppliers',
      'Cross-train team members'
    ]
  }));
}

async function predictResourceNeeds(projects: any[]) {
  return {
    upcomingNeeds: [
      { resource: 'Concrete', quantity: 500, unit: 'cubic yards', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      { resource: 'Steel', quantity: 200, unit: 'tons', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) }
    ],
    laborForecast: [
      { role: 'Carpenter', hours: 120, week: '2024-02-01' },
      { role: 'Electrician', hours: 80, week: '2024-02-08' }
    ]
  };
}

async function predictQualityIssues(projects: any[]) {
  return projects.map(project => ({
    projectId: project.id,
    projectName: project.name,
    qualityScore: project.quality_score,
    predictedIssues: [
      { type: 'material_defect', probability: 0.1, severity: 'low' },
      { type: 'workmanship', probability: 0.05, severity: 'medium' }
    ],
    qualityTrend: 'improving'
  }));
}

function generateTimeSeriesData(projects: any[], granularity: string) {
  // Mock time series data generation
  const periods = granularity === 'daily' ? 30 : granularity === 'weekly' ? 12 : 12;
  
  return Array.from({ length: periods }, (_, i) => ({
    period: new Date(Date.now() - i * (granularity === 'daily' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000)).toISOString(),
    progress: Math.random() * 100,
    budget: Math.random() * 1000000,
    quality: Math.random() * 100,
    safety: Math.random() * 100
  })).reverse();
}

function calculatePortfolioHealth(projects: any[]) {
  const totalProjects = projects.length;
  const onTimeProjects = projects.filter(p => p.spi >= 0.95).length;
  const onBudgetProjects = projects.filter(p => p.cpi >= 0.95).length;
  const qualityProjects = projects.filter(p => p.quality_score >= 80).length;
  
  return {
    overall: (onTimeProjects + onBudgetProjects + qualityProjects) / (totalProjects * 3),
    onTime: onTimeProjects / totalProjects,
    onBudget: onBudgetProjects / totalProjects,
    quality: qualityProjects / totalProjects
  };
}

function calculateResourceEfficiency(projects: any[]) {
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
  
  return {
    budgetUtilization: totalSpent / totalBudget,
    costEfficiency: projects.reduce((sum, p) => sum + p.cpi, 0) / projects.length,
    resourceOptimization: 0.87 // Mock calculation
  };
}

function calculateCostPerformance(projects: any[]) {
  return {
    averageCPI: projects.reduce((sum, p) => sum + p.cpi, 0) / projects.length,
    budgetVariance: projects.reduce((sum, p) => sum + (p.spent - p.budget), 0) / projects.length,
    costTrend: 'decreasing'
  };
}

function calculateSchedulePerformance(projects: any[]) {
  return {
    averageSPI: projects.reduce((sum, p) => sum + p.spi, 0) / projects.length,
    onTimeDelivery: projects.filter(p => p.spi >= 0.95).length / projects.length,
    scheduleTrend: 'improving'
  };
}

function calculateQualityTrends(projects: any[]) {
  return {
    averageQuality: projects.reduce((sum, p) => sum + p.quality_score, 0) / projects.length,
    qualityImprovement: 0.05, // 5% improvement
    defectRate: 0.02 // 2% defect rate
  };
}

function calculateRiskDistribution(projects: any[]) {
  const risks = projects.reduce((acc, p) => {
    acc[p.risk_level] = (acc[p.risk_level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    low: risks.low || 0,
    medium: risks.medium || 0,
    high: risks.high || 0,
    total: projects.length
  };
}

function calculateTeamProductivity(projects: any[]) {
  return {
    averageProgress: projects.reduce((sum, p) => sum + p.progress, 0) / projects.length,
    productivityIndex: 1.15, // 15% above baseline
    teamUtilization: 0.87 // 87% utilization
  };
}

function calculateClientSatisfaction(projects: any[]) {
  return {
    averageScore: 4.2, // Mock score
    satisfactionTrend: 'improving',
    clientRetention: 0.92 // 92% retention
  };
}

function generateAnalyticsSummary(projects: any[]) {
  return {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
    totalSpent: projects.reduce((sum, p) => sum + p.spent, 0),
    averageProgress: projects.reduce((sum, p) => sum + p.progress, 0) / projects.length
  };
}

function generateInsights(projects: any[]) {
  return [
    {
      type: 'success',
      title: 'Quality Improvement',
      message: 'Project quality scores have improved by 8% this quarter',
      impact: 'high'
    },
    {
      type: 'warning',
      title: 'Schedule Risk',
      message: '3 projects are at risk of schedule delays',
      impact: 'medium'
    },
    {
      type: 'info',
      title: 'Cost Efficiency',
      message: 'Overall cost performance index is above industry average',
      impact: 'low'
    }
  ];
}

function generateRecommendations(metrics: any) {
  return [
    {
      category: 'cost',
      priority: 'high',
      recommendation: 'Implement automated cost tracking to improve budget visibility',
      expectedImpact: 'Reduce cost overruns by 15%'
    },
    {
      category: 'schedule',
      priority: 'medium',
      recommendation: 'Add buffer time for weather-dependent activities',
      expectedImpact: 'Improve on-time delivery by 10%'
    },
    {
      category: 'quality',
      priority: 'low',
      recommendation: 'Implement daily quality checklists',
      expectedImpact: 'Increase quality scores by 5%'
    }
  ];
}

async function generateReportData(userId: string, type: string, filters: any) {
  // Mock report data generation
  return {
    type,
    generatedAt: new Date().toISOString(),
    data: {
      projects: [],
      analytics: {},
      summary: {}
    }
  };
}

async function formatReport(data: any, format: string, includeCharts: boolean) {
  switch (format) {
    case 'pdf':
      return JSON.stringify({ message: 'PDF generation not implemented in demo', data });
    case 'excel':
      return JSON.stringify({ message: 'Excel generation not implemented in demo', data });
    case 'csv':
      return 'Project,Status,Progress\nDemo Project,Active,75%';
    default:
      return JSON.stringify(data, null, 2);
  }
}

function calculateUserPerformance(projects: any[]) {
  return {
    averageCPI: projects.reduce((sum, p) => sum + p.cpi, 0) / projects.length,
    averageSPI: projects.reduce((sum, p) => sum + p.spi, 0) / projects.length,
    averageQuality: projects.reduce((sum, p) => sum + p.quality_score, 0) / projects.length,
    averageSafety: projects.reduce((sum, p) => sum + p.safety_score, 0) / projects.length
  };
}

function compareToBenchmarks(userPerformance: any, benchmarks: any) {
  return {
    cpi: {
      user: userPerformance.averageCPI,
      benchmark: benchmarks.averageCPI,
      performance: userPerformance.averageCPI > benchmarks.averageCPI ? 'above' : 'below'
    },
    spi: {
      user: userPerformance.averageSPI,
      benchmark: benchmarks.averageSPI,
      performance: userPerformance.averageSPI > benchmarks.averageSPI ? 'above' : 'below'
    },
    quality: {
      user: userPerformance.averageQuality,
      benchmark: benchmarks.averageQualityScore,
      performance: userPerformance.averageQuality > benchmarks.averageQualityScore ? 'above' : 'below'
    },
    safety: {
      user: userPerformance.averageSafety,
      benchmark: benchmarks.averageSafetyScore,
      performance: userPerformance.averageSafety > benchmarks.averageSafetyScore ? 'above' : 'below'
    }
  };
}

async function getActiveProjectsCount(userId: string) {
  const projects = await ProjectsService.getUserProjects(userId);
  return projects.filter(p => p.status === 'active').length;
}

async function getCurrentSpend(userId: string) {
  const projects = await ProjectsService.getUserProjects(userId);
  return projects.reduce((sum, p) => sum + p.spent, 0);
}

async function getTeamUtilization(userId: string) {
  return 0.87; // Mock utilization
}

async function getActiveRiskAlerts(userId: string) {
  return [
    { id: 1, project: 'Demo Project', risk: 'Weather delay', severity: 'medium' },
    { id: 2, project: 'Another Project', risk: 'Material shortage', severity: 'high' }
  ];
}

async function getQualityIssues(userId: string) {
  return [
    { id: 1, project: 'Demo Project', issue: 'Minor material defect', status: 'resolved' },
    { id: 2, project: 'Another Project', issue: 'Workmanship concern', status: 'pending' }
  ];
}

async function getTimelineVariances(userId: string) {
  return [
    { project: 'Demo Project', variance: 0.95, status: 'on_track' },
    { project: 'Another Project', variance: 0.88, status: 'at_risk' }
  ];
}
