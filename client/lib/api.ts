/**
 * Centralized API Service
 * Handles all API communications with proper authentication and error handling
 */

import { AuthError, User } from '@shared/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: AuthError[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private baseUrl = '/api';
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData.errors
      );
    }

    return response.json();
  }

  private async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData: Record<string, any> = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const formData = new FormData();
    formData.append('file', file);
    
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, JSON.stringify(value));
    });

    const headers: HeadersInit = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData.errors
      );
    }

    return response.json();
  }

  // Authentication
  async login(email: string, password: string) {
    return this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(email: string, password: string, name: string) {
    return this.request<{ user: User; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async getProfile() {
    return this.request<User>('/auth/profile');
  }

  // User Data endpoints
  async getUserData() {
    return this.request<any>('/user/data');
  }

  async updateUserData(userData: any) {
    return this.request<any>('/user/data', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async getUserActivity(params?: any) {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    const queryString = queryParams.toString();
    return this.request<any>(`/user/activity${queryString ? `?${queryString}` : ''}`);
  }

  async getUserStatistics() {
    return this.request<any>('/user/statistics');
  }

  async getUserPreferences() {
    return this.request<any>('/user/preferences');
  }

  async updateUserPreferences(preferences: any) {
    return this.request<any>('/user/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // Projects & Materials
  async getProjects() {
    return this.request<any[]>('/projects');
  }

  async createProject(projectData: any) {
    return this.request<any>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id: string, projectData: any) {
    return this.request<any>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(id: string) {
    return this.request<void>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async getMaterials(projectId: string) {
    return this.request<any[]>(`/projects/${projectId}/materials`);
  }

  async createMaterial(projectId: string, materialData: any) {
    return this.request<any>(`/projects/${projectId}/materials`, {
      method: 'POST',
      body: JSON.stringify(materialData),
    });
  }

  async updateMaterial(materialId: string, materialData: any) {
    return this.request<any>(`/materials/${materialId}`, {
      method: 'PUT',
      body: JSON.stringify(materialData),
    });
  }

  async deleteMaterial(materialId: string) {
    return this.request<void>(`/materials/${materialId}`, {
      method: 'DELETE',
    });
  }

  // Files
  async uploadFile(file: File, metadata?: any) {
    return this.uploadFile<any>('/files/upload', file, { metadata });
  }

  async getFiles() {
    return this.request<any[]>('/files');
  }

  async getFile(id: string) {
    return this.request<any>(`/files/${id}`);
  }

  async deleteFile(id: string) {
    return this.request<void>(`/files/${id}`, {
      method: 'DELETE',
    });
  }

  async getProjectFiles(projectId: string) {
    return this.request<any[]>(`/projects/${projectId}/files`);
  }

  // Notifications
  async getNotifications() {
    return this.request<{ notifications: any[] }>('/notifications');
  }

  async markNotificationAsRead(id: string) {
    return this.request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'POST',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request<{ success: boolean }>('/notifications/read-all', {
      method: 'POST',
    });
  }

  // Integrations
  async getWeather(location: string) {
    return this.request<any>(`/integrations/weather?location=${encodeURIComponent(location)}`);
  }

  async sendEmail(emailData: { to: string; subject: string; body: string }) {
    return this.request<any>('/integrations/email', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  }

  async sendSMS(smsData: { to: string; message: string }) {
    return this.request<any>('/integrations/sms', {
      method: 'POST',
      body: JSON.stringify(smsData),
    });
  }

  async getLocation(address: string) {
    return this.request<any>(`/integrations/location?address=${encodeURIComponent(address)}`);
  }

  async getCalendarEvents() {
    return this.request<{ events: any[] }>('/integrations/calendar');
  }

  async exportData(exportData: { dataType: string; format: string; data: any }) {
    return this.request<any>('/integrations/export', {
      method: 'POST',
      body: JSON.stringify(exportData),
    });
  }

  async getSystemHealth() {
    return this.request<any>('/integrations/health');
  }

  // Analytics
  async getAdvancedAnalytics() {
    return this.request<any>('/analytics/advanced');
  }

  async getPredictiveAnalytics() {
    return this.request<any>('/analytics/predictive');
  }

  async generateReport(reportData: any) {
    return this.request<any>('/analytics/report', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async getBenchmarking() {
    return this.request<any>('/analytics/benchmarking');
  }

  async getPerformanceMonitoring() {
    return this.request<any>('/analytics/performance');
  }

  // AI/ML
  async performAIAnalysis(analysisData: any) {
    return this.request<any>('/ai/analysis', {
      method: 'POST',
      body: JSON.stringify(analysisData),
    });
  }

  async getMLPredictions(predictionData: any) {
    return this.request<any>('/ai/predictions', {
      method: 'POST',
      body: JSON.stringify(predictionData),
    });
  }

  async performComputerVisionAnalysis(visionData: any) {
    return this.request<any>('/ai/computer-vision', {
      method: 'POST',
      body: JSON.stringify(visionData),
    });
  }

  async getSmartResourceOptimization(projectId: string, optimizationType: string, constraints?: any) {
    const params = new URLSearchParams({
      projectId,
      optimizationType,
      ...(constraints && { constraints: JSON.stringify(constraints) }),
    });
    return this.request<any>(`/ai/optimization?${params}`);
  }

  async getAIRiskAssessment(projectId?: string, riskFactors?: any) {
    const params = new URLSearchParams();
    if (projectId) params.append('projectId', projectId);
    if (riskFactors) params.append('riskFactors', JSON.stringify(riskFactors));
    return this.request<any>(`/ai/risk-assessment?${params}`);
  }

  async performSmartQualityControl(qualityData: any) {
    return this.request<any>('/ai/quality-control', {
      method: 'POST',
      body: JSON.stringify(qualityData),
    });
  }

  // IoT
  async registerIoTDevice(deviceData: any) {
    return this.request<any>('/iot/devices', {
      method: 'POST',
      body: JSON.stringify(deviceData),
    });
  }

  async ingestIoTData(data: any) {
    return this.request<any>('/iot/data', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createIoTAlert(alertData: any) {
    return this.request<any>('/iot/alerts', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  }

  async getIoTDashboard() {
    return this.request<any>('/iot/dashboard');
  }

  async getEquipmentMonitoring(equipmentId: string) {
    return this.request<any>(`/iot/equipment/${equipmentId}`);
  }

  async getEnvironmentalMonitoring() {
    return this.request<any>('/iot/environmental');
  }

  async getSafetyMonitoring() {
    return this.request<any>('/iot/safety');
  }

  // IoT Advanced
  async createIoTFleet(fleetData: any) {
    return this.request<any>('/iot/fleets', {
      method: 'POST',
      body: JSON.stringify(fleetData),
    });
  }

  async registerDevice(deviceData: any) {
    return this.request<any>('/iot/devices/register', {
      method: 'POST',
      body: JSON.stringify(deviceData),
    });
  }

  async ingestData(data: any) {
    return this.request<any>('/iot/data/ingest', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getFleetAnalytics(fleetId?: string, timeRange?: string) {
    const params = new URLSearchParams();
    if (fleetId) params.append('fleetId', fleetId);
    if (timeRange) params.append('timeRange', timeRange);
    return this.request<any>(`/iot/fleets/analytics?${params}`);
  }

  async getPredictiveMaintenance(fleetId?: string) {
    const params = fleetId ? `?fleetId=${fleetId}` : '';
    return this.request<any>(`/iot/maintenance/predictive${params}`);
  }

  async configureIoTAlerts(alertConfig: any) {
    return this.request<any>('/iot/alerts/configure', {
      method: 'POST',
      body: JSON.stringify(alertConfig),
    });
  }

  async getDevicePerformance(deviceId: string, metrics?: string) {
    const params = metrics ? `?metrics=${metrics}` : '';
    return this.request<any>(`/iot/devices/${deviceId}/performance${params}`);
  }

  async getEnergyOptimization(fleetId?: string) {
    const params = fleetId ? `?fleetId=${fleetId}` : '';
    return this.request<any>(`/iot/energy/optimization${params}`);
  }

  // Blockchain
  async createBlockchainTransaction(transactionData: any) {
    return this.request<any>('/blockchain/transaction', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async deploySmartContract(contractData: any) {
    return this.request<any>('/blockchain/smart-contract', {
      method: 'POST',
      body: JSON.stringify(contractData),
    });
  }

  async mintNFT(nftData: any) {
    return this.request<any>('/blockchain/nft', {
      method: 'POST',
      body: JSON.stringify(nftData),
    });
  }

  async auditBlockchain(contractAddress: string) {
    return this.request<any>(`/blockchain/audit?address=${encodeURIComponent(contractAddress)}`);
  }

  async trackSupplyChain(trackingId: string) {
    return this.request<any>(`/blockchain/supply-chain?trackingId=${encodeURIComponent(trackingId)}`);
  }

  async verifyIdentity(identityData: any) {
    return this.request<any>('/blockchain/identity', {
      method: 'POST',
      body: JSON.stringify(identityData),
    });
  }

  async certifyQuality(qualityData: any) {
    return this.request<any>('/blockchain/quality-certification', {
      method: 'POST',
      body: JSON.stringify(qualityData),
    });
  }

  // Blockchain Marketplace
  async submitSmartContract(contractData: any) {
    return this.request<any>('/blockchain/contracts/submit', {
      method: 'POST',
      body: JSON.stringify(contractData),
    });
  }

  async purchaseSmartContract(contractId: string) {
    return this.request<any>(`/blockchain/contracts/purchase`, {
      method: 'POST',
      body: JSON.stringify({ contractId }),
    });
  }

  async deploySmartContract(contractId: string, network: string, constructorArgs?: any[]) {
    return this.request<any>(`/blockchain/contracts/deploy`, {
      method: 'POST',
      body: JSON.stringify({ contractId, network, constructorArgs }),
    });
  }

  async interactWithContract(deploymentId: string, method: string, parameters: Record<string, any>) {
    return this.request<any>(`/blockchain/contracts/interact`, {
      method: 'POST',
      body: JSON.stringify({ deploymentId, method, parameters }),
    });
  }

  async getContractAnalytics(contractId?: string, deploymentId?: string) {
    const params = new URLSearchParams();
    if (contractId) params.append('contractId', contractId);
    if (deploymentId) params.append('deploymentId', deploymentId);
    return this.request<any>(`/blockchain/contracts/analytics?${params}`);
  }

  async verifySmartContract(contractId: string, verificationData: any) {
    return this.request<any>(`/blockchain/contracts/verify`, {
      method: 'POST',
      body: JSON.stringify({ contractId, ...verificationData }),
    });
  }

  async getUserContracts() {
    return this.request<any[]>('/blockchain/contracts/user');
  }

  async compileSmartContract(sourceCode: string, compilerVersion?: string, optimization?: boolean) {
    return this.request<any>('/blockchain/contracts/compile', {
      method: 'POST',
      body: JSON.stringify({ sourceCode, compilerVersion, optimization }),
    });
  }

  // VR/AR
  async createVRSession(sessionData: any) {
    return this.request<any>('/vr/session', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async createAROverlay(overlayData: any) {
    return this.request<any>('/ar/overlay', {
      method: 'POST',
      body: JSON.stringify(overlayData),
    });
  }

  async upload3DModel(modelData: any, file: File) {
    return this.uploadFile<any>('/vr-ar/model', file, modelData);
  }

  async createVRTrainingSession(trainingData: any) {
    return this.request<any>('/vr/training', {
      method: 'POST',
      body: JSON.stringify(trainingData),
    });
  }

  async createARSiteInspection(inspectionData: any) {
    return this.request<any>('/ar/inspection', {
      method: 'POST',
      body: JSON.stringify(inspectionData),
    });
  }

  async createVRClientPresentation(presentationData: any) {
    return this.request<any>('/vr/presentation', {
      method: 'POST',
      body: JSON.stringify(presentationData),
    });
  }

  async createARProgressVisualization(visualizationData: any) {
    return this.request<any>('/ar/progress', {
      method: 'POST',
      body: JSON.stringify(visualizationData),
    });
  }

  // Automation
  async createWorkflow(workflowData: any) {
    return this.request<any>('/automation/workflow', {
      method: 'POST',
      body: JSON.stringify(workflowData),
    });
  }

  async createAutomationRule(ruleData: any) {
    return this.request<any>('/automation/rule', {
      method: 'POST',
      body: JSON.stringify(ruleData),
    });
  }

  async createSmartSchedule(scheduleData: any) {
    return this.request<any>('/automation/scheduling', {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    });
  }

  async createQualityControl(qualityData: any) {
    return this.request<any>('/automation/quality-control', {
      method: 'POST',
      body: JSON.stringify(qualityData),
    });
  }

  async createResourceAllocation(allocationData: any) {
    return this.request<any>('/automation/resource-allocation', {
      method: 'POST',
      body: JSON.stringify(allocationData),
    });
  }

  async createAutomatedReport(reportData: any) {
    return this.request<any>('/automation/reporting', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async processDocument(documentData: any, file: File) {
    return this.uploadFile<any>('/automation/document-processing', file, documentData);
  }

  // ML Training
  async createMLModel(modelData: any) {
    return this.request<any>('/ml/models', {
      method: 'POST',
      body: JSON.stringify(modelData),
    });
  }

  async startMLTraining(modelId: string, trainingConfig: any) {
    return this.request<any>(`/ml/models/${modelId}/train`, {
      method: 'POST',
      body: JSON.stringify(trainingConfig),
    });
  }

  async getMLTrainingStatus(modelId: string) {
    return this.request<any>(`/ml/models/${modelId}/training-status`);
  }

  async uploadMLDataset(datasetData: any, file: File) {
    return this.uploadFile<any>('/ml/datasets', file, datasetData);
  }

  async createMLPipeline(pipelineData: any) {
    return this.request<any>('/ml/pipelines', {
      method: 'POST',
      body: JSON.stringify(pipelineData),
    });
  }

  async executeMLPipeline(pipelineId: string, inputData: any) {
    return this.request<any>(`/ml/pipelines/${pipelineId}/execute`, {
      method: 'POST',
      body: JSON.stringify(inputData),
    });
  }

  async deployMLModel(modelId: string, deploymentConfig: any) {
    return this.request<any>(`/ml/models/${modelId}/deploy`, {
      method: 'POST',
      body: JSON.stringify(deploymentConfig),
    });
  }

  async getMLPredictions(modelId: string, inputData: any) {
    return this.request<any>(`/ml/models/${modelId}/predict`, {
      method: 'POST',
      body: JSON.stringify(inputData),
    });
  }

  async getMLModelMetrics(modelId: string) {
    return this.request<any>(`/ml/models/${modelId}/metrics`);
  }
}

export const api = new ApiService();