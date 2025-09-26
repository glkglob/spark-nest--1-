import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Upload, Play, BarChart3, Settings, FileText, Zap, Target } from 'lucide-react';
import { handleError } from '@/lib/error-handler';
import { logError, logInfo } from '@/lib/error-logger';
import { useML } from '@/hooks/use-ml';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useRetry } from '@/hooks/use-retry';
import ErrorDisplay from '@/components/ErrorDisplay';

interface ModelTraining {
  id: string;
  name: string;
  type: 'progress_prediction' | 'quality_assessment' | 'safety_analysis' | 'cost_optimization';
  status: 'draft' | 'training' | 'completed' | 'failed';
  accuracy: number;
  datasetSize: number;
  trainingProgress: number;
  createdAt: string;
  lastTrained: string;
}

interface TrainingDataset {
  id: string;
  name: string;
  type: string;
  size: number;
  features: string[];
  uploadDate: string;
}

const AIModelTraining: React.FC = () => {
  // ML Service Hook Integration
  const {
    models: mlModels,
    datasets: mlDatasets,
    pipelines,
    loading: mlLoading,
    error: mlError,
    createModel,
    startTraining,
    uploadDataset,
    createPipeline,
    getPredictions,
    getModelMetrics
  } = useML();

  // Error Handling
  const {
    error: errorState,
    isError,
    handleError: handleErrorWithState,
    clearError,
    showSuccessToast
  } = useErrorHandler({
    component: 'AIModelTraining',
    showToast: true,
    logError: true
  });

  // Retry Mechanism
  const { executeWithRetry, isRetrying } = useRetry({
    maxAttempts: 3,
    delay: 1000,
    exponentialBackoff: true
  });

  // Local State
  const [selectedModel, setSelectedModel] = useState<ModelTraining | null>(null);
  const [newModel, setNewModel] = useState({
    name: '',
    type: 'progress_prediction' as const,
    datasetId: '',
    description: ''
  });

  // Convert ML models to local format for compatibility
  const models: ModelTraining[] = mlModels.map(mlModel => ({
    id: mlModel.id,
    name: mlModel.name,
    type: mlModel.type as any,
    status: mlModel.status as any,
    accuracy: mlModel.accuracy,
    datasetSize: mlModel.dataset.samples,
    trainingProgress: mlModel.status === 'training' ? 75 : mlModel.status === 'trained' ? 100 : 0,
    createdAt: mlModel.createdAt.split('T')[0],
    lastTrained: mlModel.status === 'trained' ? mlModel.updatedAt.split('T')[0] : 'Never'
  }));

  // Convert ML datasets to local format
  const datasets: TrainingDataset[] = mlDatasets.map(mlDataset => ({
    id: mlDataset.id,
    name: mlDataset.name,
    type: mlDataset.type,
    size: mlDataset.size,
    features: Array.from({ length: mlDataset.features }, (_, i) => `feature_${i + 1}`),
    uploadDate: mlDataset.uploadedAt.split('T')[0]
  }));

  const handleCreateModel = async () => {
    await executeWithRetry(async () => {
      // Validate input
      if (!newModel.name.trim()) {
        throw new Error('Model name is required');
      }
      if (!newModel.datasetId) {
        throw new Error('Please select a training dataset');
      }

      const selectedDataset = datasets.find(d => d.id === newModel.datasetId);
      if (!selectedDataset) {
        throw new Error('Selected dataset not found');
      }

      // Create model using ML service
      const modelData = {
        name: newModel.name.trim(),
        description: newModel.description,
        type: 'classification' as const, // Map to ML service type
        algorithm: 'random_forest',
        datasetId: newModel.datasetId,
        hyperparameters: {
          n_estimators: 100,
          max_depth: 10,
          random_state: 42
        }
      };

      const createdModel = await createModel(modelData);
      
      setNewModel({ name: '', type: 'progress_prediction', datasetId: '', description: '' });
      showSuccessToast('Model created successfully');
      
      return createdModel;
    }, 'createModel');
  };

  const handleStartTraining = async (modelId: string) => {
    await executeWithRetry(async () => {
      const model = models.find(m => m.id === modelId);
      if (!model) {
        throw new Error('Model not found');
      }

      if (model.status !== 'draft') {
        throw new Error('Only draft models can be trained');
      }

      // Start training using ML service
      const trainingResult = await startTraining(modelId, {
        epochs: 100,
        batchSize: 32,
        learningRate: 0.001,
        validationSplit: 0.2
      });

      showSuccessToast('Training started successfully');
      return trainingResult;
    }, 'startTraining');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'training': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getModelTypeIcon = (type: string) => {
    switch (type) {
      case 'progress_prediction': return <BarChart3 className="h-4 w-4" />;
      case 'quality_assessment': return <Target className="h-4 w-4" />;
      case 'safety_analysis': return <Zap className="h-4 w-4" />;
      case 'cost_optimization': return <Settings className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-600" />
            AI Model Training
          </h1>
          <p className="text-muted-foreground mt-2">
            Train, deploy, and manage machine learning models for construction intelligence
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload Dataset
        </Button>
      </div>

      <Tabs defaultValue="models" className="space-y-6">
        <TabsList>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="datasets">Datasets</TabsTrigger>
          <TabsTrigger value="training">Training Pipeline</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-6">
          <div className="grid gap-6">
            {/* Create New Model */}
            <Card>
              <CardHeader>
                <CardTitle>Create New Model</CardTitle>
                <CardDescription>
                  Set up a new machine learning model for construction analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="model-name">Model Name</Label>
                    <Input
                      id="model-name"
                      value={newModel.name}
                      onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                      placeholder="Enter model name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="model-type">Model Type</Label>
                    <Select 
                      value={newModel.type} 
                      onValueChange={(value: any) => setNewModel({ ...newModel, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select model type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="progress_prediction">Progress Prediction</SelectItem>
                        <SelectItem value="quality_assessment">Quality Assessment</SelectItem>
                        <SelectItem value="safety_analysis">Safety Analysis</SelectItem>
                        <SelectItem value="cost_optimization">Cost Optimization</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="dataset">Training Dataset</Label>
                  <Select 
                    value={newModel.datasetId} 
                    onValueChange={(value) => setNewModel({ ...newModel, datasetId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select training dataset" />
                    </SelectTrigger>
                    <SelectContent>
                      {datasets.map((dataset) => (
                        <SelectItem key={dataset.id} value={dataset.id}>
                          {dataset.name} ({dataset.size} samples)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newModel.description}
                    onChange={(e) => setNewModel({ ...newModel, description: e.target.value })}
                    placeholder="Describe the model's purpose and expected outcomes"
                  />
                </div>
                <Button 
                  onClick={handleCreateModel} 
                  disabled={!newModel.name || !newModel.datasetId || mlLoading || isRetrying}
                  className="flex items-center gap-2"
                >
                  {mlLoading || isRetrying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Model'
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Error Display */}
            <ErrorDisplay
              error={errorState || mlError}
              title="AI Model Training Error"
              description="There was an issue with the AI model training process"
              showRetry={true}
              onRetry={() => {
                clearError();
                // Refresh data by re-mounting or calling refresh functions
                window.location.reload();
              }}
              onDismiss={clearError}
              size="md"
            />

            {/* Models List */}
            <div className="grid gap-4">
              {models.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Models Yet</h3>
                    <p className="text-muted-foreground">
                      Create your first AI model to get started with machine learning.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                models.map((model) => (
                <Card key={model.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getModelTypeIcon(model.type)}
                        <div>
                          <h3 className="font-semibold">{model.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Created: {model.createdAt} • Last trained: {model.lastTrained}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(model.status)}>
                          {model.status}
                        </Badge>
                        {model.status === 'draft' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleStartTraining(model.id)}
                            disabled={mlLoading || isRetrying}
                            className="flex items-center gap-1"
                          >
                            {mlLoading || isRetrying ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                Starting...
                              </>
                            ) : (
                              <>
                                <Play className="h-3 w-3" />
                                Train
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Accuracy</p>
                        <p className="text-lg font-semibold">
                          {model.accuracy > 0 ? `${model.accuracy.toFixed(1)}%` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Dataset Size</p>
                        <p className="text-lg font-semibold">{model.datasetSize.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Model Type</p>
                        <p className="text-lg font-semibold capitalize">
                          {model.type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>

                    {model.status === 'training' && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Training Progress</span>
                          <span>{model.trainingProgress}%</span>
                        </div>
                        <Progress value={model.trainingProgress} className="w-full" />
                      </div>
                    )}
                  </CardContent>
                </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="datasets" className="space-y-6">
          <div className="grid gap-4">
            {datasets.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Datasets Available</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload training datasets to start creating AI models.
                  </p>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Dataset
                  </Button>
                </CardContent>
              </Card>
            ) : (
              datasets.map((dataset) => (
              <Card key={dataset.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{dataset.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {dataset.type} • {dataset.size.toLocaleString()} samples • Uploaded: {dataset.uploadDate}
                      </p>
                    </div>
                    <Badge variant="outline">{dataset.type}</Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Features:</p>
                    <div className="flex flex-wrap gap-2">
                      {dataset.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              The training pipeline automatically preprocesses data, trains models, and evaluates performance. 
              Advanced hyperparameter tuning and cross-validation are included.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Training Pipeline Configuration</CardTitle>
              <CardDescription>
                Configure the machine learning training pipeline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Algorithm</Label>
                  <Select defaultValue="random_forest">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="random_forest">Random Forest</SelectItem>
                      <SelectItem value="neural_network">Neural Network</SelectItem>
                      <SelectItem value="gradient_boosting">Gradient Boosting</SelectItem>
                      <SelectItem value="svm">Support Vector Machine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cross-Validation Folds</Label>
                  <Select defaultValue="5">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Folds</SelectItem>
                      <SelectItem value="5">5 Folds</SelectItem>
                      <SelectItem value="10">10 Folds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Training Split</Label>
                  <Input defaultValue="80" placeholder="Training data percentage" />
                </div>
                <div>
                  <Label>Test Split</Label>
                  <Input defaultValue="20" placeholder="Test data percentage" />
                </div>
              </div>

              <Button className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Configure Advanced Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Model Deployment</CardTitle>
              <CardDescription>
                Deploy trained models to production for real-time predictions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {models.filter(m => m.status === 'completed').length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Completed Models</h3>
                      <p className="text-muted-foreground">
                        Train and complete models to deploy them to production.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  models.filter(m => m.status === 'completed').map((model) => (
                  <div key={model.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getModelTypeIcon(model.type)}
                      <div>
                        <h4 className="font-medium">{model.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Accuracy: {model.accuracy.toFixed(1)}% • Dataset: {model.datasetSize} samples
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Deploy to Staging
                      </Button>
                      <Button size="sm">
                        Deploy to Production
                      </Button>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIModelTraining;
