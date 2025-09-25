import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { handleDemo } from "./routes/demo";
import { handleLogin, handleSignup, handleProfile, authenticateToken } from "./routes/auth";
import { 
  handleForgotPassword, 
  handleResetPassword, 
  handleChangePassword, 
  handleVerifyResetToken 
} from "./routes/password-reset";
import {
  handleGetUserData,
  handleUpdateUserData,
  handleGetUserActivity,
  handleGetUserStatistics,
  handleGetUserPreferences,
  handleUpdateUserPreferences
} from "./routes/user-data";
import {
  handleGetProjects,
  handleGetProject,
  handleCreateProject,
  handleUpdateProject,
  handleDeleteProject,
  handleGetMaterials,
  handleCreateMaterial,
  handleUpdateMaterial,
  handleDeleteMaterial,
} from "./routes/projects";
import {
  handleUploadFile,
  handleGetFiles,
  handleGetFile,
  handleDeleteFile,
  handleGetProjectFiles,
  upload,
} from "./routes/files";
import { NotificationService } from "./lib/notifications";
import { 
  handleGetWeather,
  handleSendEmail,
  handleSendSMS,
  handleGetLocation,
  handleGetCalendarEvents,
  handleExportData,
  handleSystemHealth
} from "./routes/integrations";
import { 
  handleAdvancedAnalytics,
  handlePredictiveAnalytics,
  handleGenerateReport,
  handleBenchmarking,
  handlePerformanceMonitoring
} from "./routes/advanced-analytics";
import { 
  authRateLimit,
  apiRateLimit,
  uploadRateLimit,
  speedLimiter,
  sanitizeInput,
  securityLogger,
  ipFilter,
  contentSecurityPolicy,
  requestSizeLimit,
  requestTimeout,
  securityHeaders,
  bruteForceProtection
} from "./middleware/security";
import { 
  cacheProjects,
  cacheAnalytics,
  cacheWeather,
  cacheUserProfile,
  getCacheStats,
  clearCache,
  compressResponse
} from "./middleware/caching";
import { 
  handleAIProgressAnalysis,
  handleMLPredictions,
  handleComputerVisionAnalysis,
  handleSmartResourceOptimization,
  handleAIRiskAssessment,
  handleSmartQualityControl
} from "./routes/ai-ml";
import { 
  handleRegisterIoTDevice,
  handleIoTDataIngestion,
  handleIoTAlert,
  handleIoTDashboard,
  handleEquipmentMonitoring,
  handleEnvironmentalMonitoring,
  handleSafetyMonitoring
} from "./routes/iot";
import { 
  handleBlockchainTransaction,
  handleSmartContractDeployment,
  handleNFTMinting,
  handleBlockchainAudit,
  handleSupplyChainTracking,
  handleIdentityVerification,
  handleQualityCertification
} from "./routes/blockchain";
import { 
  handleCreateVRSession,
  handleCreateAROverlay,
  handleUpload3DModel,
  handleVRTrainingSession,
  handleARSiteInspection,
  handleVRClientPresentation,
  handleARProgressVisualization
} from "./routes/vr-ar";
import { 
  handleCreateWorkflow,
  handleCreateAutomationRule,
  handleSmartScheduling,
  handleAutomatedQualityControl,
  handleSmartResourceAllocation,
  handleAutomatedReporting,
  handleIntelligentDocumentProcessing
} from "./routes/automation";
import { 
  handleCreateModel,
  handleStartTraining,
  handleTrainingStatus,
  handleDatasetUpload,
  handleCreatePipeline,
  handleExecutePipeline,
  handleDeployModel,
  handleGetPredictions,
  handleGetModelMetrics
} from "./routes/ml-training";
import { 
  handleCreateFleet,
  handleRegisterDevice,
  handleDataIngestion,
  handleFleetAnalytics,
  handlePredictiveMaintenance,
  handleConfigureAlerts,
  handleDevicePerformance,
  handleEnergyOptimization
} from "./routes/iot-advanced";
import { 
  handleSubmitContract,
  handlePurchaseContract,
  handleDeployContract,
  handleContractInteraction,
  handleGetContractAnalytics,
  handleVerifyContract,
  handleGetUserContracts,
  handleCompileContract
} from "./routes/blockchain-marketplace";
import "./types";

export function createServer() {
  const app = express();
  
  // Initialize notification service (will be overridden in server.ts)
  let notificationService: NotificationService | null = null;

  // Security Middleware
  app.use(securityHeaders);
  app.use(contentSecurityPolicy);
  app.use(ipFilter);
  app.use(securityLogger);
  app.use(requestSizeLimit);
  app.use(requestTimeout(30000));
  app.use(sanitizeInput);
  
  // Rate Limiting
  app.use(speedLimiter);
  app.use('/api/auth', authRateLimit);
  app.use('/api/files/upload', uploadRateLimit);
  app.use('/api', apiRateLimit);
  
  // Compression and CORS
  app.use(compressResponse);
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? ["https://fusion-starter-1758821892.netlify.app"]
      : ["http://localhost:8080", "http://localhost:5173"],
    credentials: true
  }));
  
  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Helmet security
  app.use(
    helmet({
      contentSecurityPolicy: false, // Handled by custom middleware
      crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    }),
  );

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes (with brute force protection)
  app.post("/api/auth/login", bruteForceProtection, handleLogin);
  app.post("/api/auth/signup", bruteForceProtection, handleSignup);
  app.get("/api/auth/profile", authenticateToken, cacheUserProfile, handleProfile);
  
  // Password reset routes
  app.post("/api/auth/forgot-password", handleForgotPassword);
  app.post("/api/auth/reset-password", handleResetPassword);
  app.post("/api/auth/change-password", authenticateToken, handleChangePassword);
  app.get("/api/auth/verify-reset-token/:token", handleVerifyResetToken);

  // User data routes
  app.get("/api/user/data", authenticateToken, handleGetUserData);
  app.put("/api/user/data", authenticateToken, handleUpdateUserData);
  app.get("/api/user/activity", authenticateToken, handleGetUserActivity);
  app.get("/api/user/statistics", authenticateToken, handleGetUserStatistics);
  app.get("/api/user/preferences", authenticateToken, handleGetUserPreferences);
  app.put("/api/user/preferences", authenticateToken, handleUpdateUserPreferences);

  // Projects routes (with caching)
  app.get("/api/projects", authenticateToken, cacheProjects, handleGetProjects);
  app.post("/api/projects", authenticateToken, handleCreateProject);
  app.get("/api/projects/:id", authenticateToken, handleGetProject);
  app.put("/api/projects/:id", authenticateToken, handleUpdateProject);
  app.delete("/api/projects/:id", authenticateToken, handleDeleteProject);

  // Materials routes
  app.get("/api/projects/:projectId/materials", authenticateToken, handleGetMaterials);
  app.post("/api/projects/:projectId/materials", authenticateToken, handleCreateMaterial);
  app.put("/api/materials/:materialId", authenticateToken, handleUpdateMaterial);
  app.delete("/api/materials/:materialId", authenticateToken, handleDeleteMaterial);

  // File upload routes
  app.post("/api/files/upload", authenticateToken, upload.single('file'), handleUploadFile);
  app.get("/api/files", authenticateToken, handleGetFiles);
  app.get("/api/files/:id", authenticateToken, handleGetFile);
  app.delete("/api/files/:id", authenticateToken, handleDeleteFile);
  app.get("/api/projects/:projectId/files", authenticateToken, handleGetProjectFiles);

  // Notifications routes
  app.get("/api/notifications", authenticateToken, (req, res) => {
    if (notificationService) {
      const notifications = notificationService.getUserNotifications(req.userId!);
      res.json({ notifications });
    } else {
      res.json({ notifications: [] });
    }
  });

  app.post("/api/notifications/:id/read", authenticateToken, (req, res) => {
    if (notificationService) {
      notificationService.markNotificationAsRead(req.userId!, req.params.id);
    }
    res.json({ success: true });
  });

  app.post("/api/notifications/read-all", authenticateToken, (req, res) => {
    if (notificationService) {
      notificationService.markAllAsRead(req.userId!);
    }
    res.json({ success: true });
  });

  // External API Integration routes
  app.get("/api/integrations/weather", authenticateToken, cacheWeather, handleGetWeather);
  app.post("/api/integrations/email", authenticateToken, handleSendEmail);
  app.post("/api/integrations/sms", authenticateToken, handleSendSMS);
  app.get("/api/integrations/location", authenticateToken, handleGetLocation);
  app.get("/api/integrations/calendar", authenticateToken, handleGetCalendarEvents);
  app.post("/api/integrations/export", authenticateToken, handleExportData);
  app.get("/api/integrations/health", handleSystemHealth);

  // Advanced Analytics routes
  app.get("/api/analytics/advanced", authenticateToken, cacheAnalytics, handleAdvancedAnalytics);
  app.get("/api/analytics/predictive", authenticateToken, handlePredictiveAnalytics);
  app.post("/api/analytics/report", authenticateToken, handleGenerateReport);
  app.get("/api/analytics/benchmarking", authenticateToken, handleBenchmarking);
  app.get("/api/analytics/performance", authenticateToken, handlePerformanceMonitoring);

  // Cache management routes (admin only)
  app.get("/api/cache/stats", authenticateToken, getCacheStats);
  app.delete("/api/cache/clear", authenticateToken, clearCache);

  // AI/ML Routes
  app.post("/api/ai/analysis", authenticateToken, handleAIProgressAnalysis);
  app.post("/api/ai/predictions", authenticateToken, handleMLPredictions);
  app.post("/api/ai/computer-vision", authenticateToken, handleComputerVisionAnalysis);
  app.get("/api/ai/optimization", authenticateToken, handleSmartResourceOptimization);
  app.get("/api/ai/risk-assessment", authenticateToken, handleAIRiskAssessment);
  app.post("/api/ai/quality-control", authenticateToken, handleSmartQualityControl);

  // IoT Integration Routes
  app.post("/api/iot/devices", authenticateToken, handleRegisterIoTDevice);
  app.post("/api/iot/data", handleIoTDataIngestion);
  app.post("/api/iot/alerts", handleIoTAlert);
  app.get("/api/iot/dashboard", authenticateToken, handleIoTDashboard);
  app.get("/api/iot/equipment/:equipmentId", authenticateToken, handleEquipmentMonitoring);
  app.get("/api/iot/environmental", authenticateToken, handleEnvironmentalMonitoring);
  app.get("/api/iot/safety", authenticateToken, handleSafetyMonitoring);

  // Blockchain Routes
  app.post("/api/blockchain/transaction", authenticateToken, handleBlockchainTransaction);
  app.post("/api/blockchain/smart-contract", authenticateToken, handleSmartContractDeployment);
  app.post("/api/blockchain/nft", authenticateToken, handleNFTMinting);
  app.get("/api/blockchain/audit", authenticateToken, handleBlockchainAudit);
  app.get("/api/blockchain/supply-chain", authenticateToken, handleSupplyChainTracking);
  app.get("/api/blockchain/identity", authenticateToken, handleIdentityVerification);
  app.post("/api/blockchain/quality-certification", authenticateToken, handleQualityCertification);

  // VR/AR Routes
  app.post("/api/vr/session", authenticateToken, handleCreateVRSession);
  app.post("/api/ar/overlay", authenticateToken, handleCreateAROverlay);
  app.post("/api/vr-ar/model", authenticateToken, handleUpload3DModel);
  app.get("/api/vr/training", authenticateToken, handleVRTrainingSession);
  app.get("/api/ar/inspection", authenticateToken, handleARSiteInspection);
  app.post("/api/vr/presentation", authenticateToken, handleVRClientPresentation);
  app.get("/api/ar/progress", authenticateToken, handleARProgressVisualization);

  // Advanced Automation Routes
  app.post("/api/automation/workflow", authenticateToken, handleCreateWorkflow);
  app.post("/api/automation/rule", authenticateToken, handleCreateAutomationRule);
  app.post("/api/automation/scheduling", authenticateToken, handleSmartScheduling);
  app.get("/api/automation/quality-control", authenticateToken, handleAutomatedQualityControl);
  app.get("/api/automation/resource-allocation", authenticateToken, handleSmartResourceAllocation);
  app.post("/api/automation/reporting", authenticateToken, handleAutomatedReporting);
  app.post("/api/automation/document-processing", authenticateToken, handleIntelligentDocumentProcessing);

  // ML Training Routes
  app.post("/api/ml/models", authenticateToken, handleCreateModel);
  app.post("/api/ml/models/:modelId/train", authenticateToken, handleStartTraining);
  app.get("/api/ml/models/:modelId/training-status", authenticateToken, handleTrainingStatus);
  app.post("/api/ml/datasets", authenticateToken, handleDatasetUpload);
  app.post("/api/ml/pipelines", authenticateToken, handleCreatePipeline);
  app.post("/api/ml/pipelines/:pipelineId/execute", authenticateToken, handleExecutePipeline);
  app.post("/api/ml/models/:modelId/deploy", authenticateToken, handleDeployModel);
  app.post("/api/ml/models/:modelId/predict", authenticateToken, handleGetPredictions);
  app.get("/api/ml/models/:modelId/metrics", authenticateToken, handleGetModelMetrics);

  // IoT Advanced Routes
  app.post("/api/iot/fleets", authenticateToken, handleCreateFleet);
  app.post("/api/iot/devices/register", authenticateToken, handleRegisterDevice);
  app.post("/api/iot/data/ingest", handleDataIngestion);
  app.get("/api/iot/fleets/analytics", authenticateToken, handleFleetAnalytics);
  app.get("/api/iot/maintenance/predictive", authenticateToken, handlePredictiveMaintenance);
  app.post("/api/iot/alerts/configure", authenticateToken, handleConfigureAlerts);
  app.get("/api/iot/devices/:deviceId/performance", authenticateToken, handleDevicePerformance);
  app.get("/api/iot/energy/optimization", authenticateToken, handleEnergyOptimization);

  // Blockchain Marketplace Routes
  app.post("/api/blockchain/contracts/submit", authenticateToken, handleSubmitContract);
  app.post("/api/blockchain/contracts/purchase", authenticateToken, handlePurchaseContract);
  app.post("/api/blockchain/contracts/deploy", authenticateToken, handleDeployContract);
  app.post("/api/blockchain/contracts/interact", authenticateToken, handleContractInteraction);
  app.get("/api/blockchain/contracts/analytics", authenticateToken, handleGetContractAnalytics);
  app.post("/api/blockchain/contracts/verify", authenticateToken, handleVerifyContract);
  app.get("/api/blockchain/contracts/user", authenticateToken, handleGetUserContracts);
  app.post("/api/blockchain/contracts/compile", authenticateToken, handleCompileContract);

  // Make notification service available to routes
  app.locals.notificationService = notificationService;

  return app;
}
