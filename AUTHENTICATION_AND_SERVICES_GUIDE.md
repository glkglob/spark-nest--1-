# Authentication and Services Integration Guide

This guide explains how to use the comprehensive authentication system and all available services in the Construction Success Platform.

## Table of Contents

1. [Authentication System](#authentication-system)
2. [Service Hooks](#service-hooks)
3. [API Service](#api-service)
4. [Usage Examples](#usage-examples)
5. [Error Handling](#error-handling)
6. [Best Practices](#best-practices)

## Authentication System

The platform uses JWT-based authentication with the following features:

### Features
- **User Registration & Login**: Secure user authentication with email/password
- **Role-Based Access Control**: Admin, Manager, and User roles
- **Protected Routes**: Automatic route protection based on authentication status
- **Token Management**: Automatic token storage and refresh
- **Password Security**: Bcrypt hashing for password storage

### Usage

```typescript
import { useAuth } from '@/hooks/use-auth';

function LoginComponent() {
  const { login, user, isLoading } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    const result = await login({ email, password });
    if (result.success) {
      // User logged in successfully
      console.log('Welcome,', user?.name);
    } else {
      // Handle login error
      console.error('Login failed:', result.error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (user) return <div>Welcome, {user.name}!</div>;
  
  return <LoginForm onSubmit={handleLogin} />;
}
```

### User Roles

- **Admin**: Full system access, user management, system settings
- **Manager**: Project management, team oversight, reporting
- **User**: Basic project access, material management, notifications

## Service Hooks

The platform provides comprehensive service hooks for all major functionality:

### 1. IoT Management (`useIoT`)

```typescript
import { useIoT } from '@/hooks/use-iot';

function IoTDashboard() {
  const {
    devices,
    fleets,
    createFleet,
    registerDevice,
    getFleetAnalytics,
    getPredictiveMaintenance
  } = useIoT();

  const handleCreateFleet = async () => {
    try {
      const fleet = await createFleet({
        name: 'Construction Site Alpha',
        description: 'Main construction site fleet',
        location: { site: 'Site A', coordinates: { lat: 40.7128, lon: -74.0060 } }
      });
      console.log('Fleet created:', fleet);
    } catch (error) {
      console.error('Failed to create fleet:', error);
    }
  };

  return (
    <div>
      <h2>IoT Device Management</h2>
      <button onClick={handleCreateFleet}>Create New Fleet</button>
      {/* Display devices and fleets */}
    </div>
  );
}
```

### 2. Blockchain Marketplace (`useBlockchain`)

```typescript
import { useBlockchain } from '@/hooks/use-blockchain';

function BlockchainMarketplace() {
  const {
    contracts,
    deployments,
    submitContract,
    purchaseContract,
    deployContract,
    getContractAnalytics
  } = useBlockchain();

  const handleSubmitContract = async () => {
    try {
      const contract = await submitContract({
        name: 'Quality Assurance Contract',
        description: 'Smart contract for quality verification',
        category: 'quality_assurance',
        price: 100,
        currency: 'USDC',
        sourceCode: 'contract QualityAssurance { ... }'
      });
      console.log('Contract submitted:', contract);
    } catch (error) {
      console.error('Failed to submit contract:', error);
    }
  };

  return (
    <div>
      <h2>Blockchain Marketplace</h2>
      <button onClick={handleSubmitContract}>Submit Contract</button>
      {/* Display contracts and deployments */}
    </div>
  );
}
```

### 3. ML Training (`useML`)

```typescript
import { useML } from '@/hooks/use-ml';

function MLTrainingInterface() {
  const {
    models,
    datasets,
    createModel,
    startTraining,
    uploadDataset,
    getPredictions
  } = useML();

  const handleTrainModel = async () => {
    try {
      const model = await createModel({
        name: 'Project Risk Predictor',
        type: 'classification',
        algorithm: 'random_forest'
      });
      
      const training = await startTraining(model.id, {
        epochs: 100,
        learningRate: 0.01,
        batchSize: 32
      });
      
      console.log('Training started:', training);
    } catch (error) {
      console.error('Failed to train model:', error);
    }
  };

  return (
    <div>
      <h2>ML Model Training</h2>
      <button onClick={handleTrainModel}>Start Training</button>
      {/* Display models and training progress */}
    </div>
  );
}
```

### 4. VR/AR Integration (`useVRAR`)

```typescript
import { useVRAR } from '@/hooks/use-vr-ar';

function VRARInterface() {
  const {
    vrSessions,
    arOverlays,
    createVRSession,
    createAROverlay,
    upload3DModel
  } = useVRAR();

  const handleCreateVRSession = async () => {
    try {
      const session = await createVRSession({
        name: 'Safety Training Session',
        type: 'training',
        environment: 'construction_site',
        maxParticipants: 10
      });
      console.log('VR session created:', session);
    } catch (error) {
      console.error('Failed to create VR session:', error);
    }
  };

  return (
    <div>
      <h2>VR/AR Integration</h2>
      <button onClick={handleCreateVRSession}>Create VR Session</button>
      {/* Display VR sessions and AR overlays */}
    </div>
  );
}
```

### 5. Automation (`useAutomation`)

```typescript
import { useAutomation } from '@/hooks/use-automation';

function AutomationDashboard() {
  const {
    workflows,
    automationRules,
    createWorkflow,
    createAutomationRule,
    processDocument
  } = useAutomation();

  const handleCreateWorkflow = async () => {
    try {
      const workflow = await createWorkflow({
        name: 'Project Approval Workflow',
        type: 'approval',
        triggers: [{
          type: 'event',
          name: 'project_created',
          configuration: { event: 'project.created' }
        }],
        steps: [{
          type: 'notification',
          name: 'Notify Manager',
          configuration: { recipients: ['manager@company.com'] }
        }]
      });
      console.log('Workflow created:', workflow);
    } catch (error) {
      console.error('Failed to create workflow:', error);
    }
  };

  return (
    <div>
      <h2>Automation Dashboard</h2>
      <button onClick={handleCreateWorkflow}>Create Workflow</button>
      {/* Display workflows and automation rules */}
    </div>
  );
}
```

## API Service

The centralized API service (`client/lib/api.ts`) provides a unified interface for all backend communications:

### Features
- **Automatic Authentication**: JWT tokens automatically included in requests
- **Error Handling**: Consistent error handling across all endpoints
- **File Upload Support**: Built-in file upload functionality
- **Type Safety**: Full TypeScript support with proper error types

### Usage

```typescript
import { api, ApiError } from '@/lib/api';

// Set authentication token
api.setToken('your-jwt-token');

// Make authenticated requests
try {
  const projects = await api.getProjects();
  const newProject = await api.createProject({
    name: 'New Project',
    description: 'Project description'
  });
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message, error.status);
    if (error.errors) {
      error.errors.forEach(err => console.error(err.message));
    }
  }
}

// File upload
try {
  const result = await api.uploadFile(file, { projectId: '123' });
} catch (error) {
  console.error('Upload failed:', error);
}
```

## Error Handling

All services provide consistent error handling:

```typescript
import { ApiError } from '@/lib/api';

try {
  const result = await someServiceMethod();
} catch (error) {
  if (error instanceof ApiError) {
    // Handle API-specific errors
    switch (error.status) {
      case 401:
        // Unauthorized - redirect to login
        break;
      case 403:
        // Forbidden - show access denied message
        break;
      case 404:
        // Not found - show not found message
        break;
      case 500:
        // Server error - show generic error message
        break;
      default:
        // Show specific error message
        console.error(error.message);
    }
    
    // Handle validation errors
    if (error.errors) {
      error.errors.forEach(err => {
        console.error(`${err.field}: ${err.message}`);
      });
    }
  } else {
    // Handle network or other errors
    console.error('Unexpected error:', error);
  }
}
```

## Best Practices

### 1. Authentication
- Always check authentication status before making API calls
- Handle token expiration gracefully
- Provide clear feedback for authentication errors

### 2. Error Handling
- Use try-catch blocks for all async operations
- Provide user-friendly error messages
- Log errors for debugging purposes

### 3. Loading States
- Show loading indicators during API calls
- Disable buttons during operations
- Provide progress feedback for long operations

### 4. Data Management
- Use React Query for caching and synchronization
- Implement optimistic updates where appropriate
- Handle offline scenarios gracefully

### 5. Security
- Never expose sensitive data in client-side code
- Validate all user inputs
- Use HTTPS for all communications

## Available Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/profile` - Get user profile

### Projects & Materials
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/materials` - List materials
- `POST /api/projects/:id/materials` - Create material

### IoT Management
- `POST /api/iot/fleets` - Create device fleet
- `POST /api/iot/devices/register` - Register device
- `POST /api/iot/data/ingest` - Ingest sensor data
- `GET /api/iot/fleets/analytics` - Get fleet analytics

### Blockchain Marketplace
- `POST /api/blockchain/contracts/submit` - Submit contract
- `POST /api/blockchain/contracts/purchase` - Purchase contract
- `POST /api/blockchain/contracts/deploy` - Deploy contract
- `GET /api/blockchain/contracts/analytics` - Get contract analytics

### ML Training
- `POST /api/ml/models` - Create model
- `POST /api/ml/models/:id/train` - Start training
- `GET /api/ml/models/:id/training-status` - Get training status
- `POST /api/ml/datasets` - Upload dataset

### VR/AR
- `POST /api/vr/session` - Create VR session
- `POST /api/ar/overlay` - Create AR overlay
- `POST /api/vr-ar/model` - Upload 3D model

### Automation
- `POST /api/automation/workflow` - Create workflow
- `POST /api/automation/rule` - Create automation rule
- `POST /api/automation/document-processing` - Process document

This comprehensive system provides a solid foundation for building advanced construction management applications with modern authentication and service integration.
