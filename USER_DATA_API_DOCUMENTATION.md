# User Data API Documentation

This document describes the comprehensive user data management API endpoints that provide detailed user information, activity tracking, statistics, and preferences management.

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [User Data Endpoints](#user-data-endpoints)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Usage Examples](#usage-examples)

## Overview

The User Data API provides comprehensive user management capabilities including:
- **Complete User Profile Data** - Extended user information with statistics and permissions
- **Activity Tracking** - User activity history with filtering and pagination
- **Statistics & Analytics** - Detailed user performance metrics
- **Preferences Management** - User settings and customization options
- **Real-time Updates** - Live data synchronization

## Authentication

All endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

## User Data Endpoints

### 1. Get Comprehensive User Data

**Endpoint**: `GET /api/user/data`

**Description**: Retrieves complete user information including profile, statistics, recent activity, and notifications.

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response**:
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "manager",
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-12-01T00:00:00Z",
    "lastLoginAt": "2024-12-01T08:00:00Z",
    "isActive": true,
    "preferences": {
      "theme": "light",
      "language": "en",
      "notifications": {
        "email": true,
        "push": true,
        "sms": false
      },
      "dashboard": {
        "layout": "grid",
        "widgets": ["projects", "materials", "notifications", "analytics"]
      }
    },
    "statistics": {
      "totalProjects": 15,
      "activeProjects": 8,
      "completedProjects": 7,
      "totalMaterials": 125,
      "totalFiles": 45,
      "lastActivity": "2024-12-01T08:00:00Z"
    },
    "permissions": {
      "canCreateProjects": true,
      "canManageUsers": false,
      "canAccessAnalytics": true,
      "canManageIoT": true,
      "canAccessBlockchain": true,
      "canManageVRAR": true,
      "canManageAutomation": true
    }
  },
  "recentActivity": [
    {
      "id": "1",
      "type": "project_created",
      "description": "Created new project \"Office Building Alpha\"",
      "timestamp": "2024-12-01T06:00:00Z",
      "metadata": {
        "projectId": "proj_123",
        "projectName": "Office Building Alpha"
      }
    }
  ],
  "notifications": [
    {
      "id": "notif_1",
      "type": "info",
      "title": "Project Update",
      "message": "Project \"Office Building Alpha\" is 75% complete",
      "read": false,
      "timestamp": "2024-12-01T07:00:00Z",
      "actionUrl": "/projects/proj_123"
    }
  ]
}
```

### 2. Update User Data

**Endpoint**: `PUT /api/user/data`

**Description**: Updates user profile information and basic settings.

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "John Smith",
  "avatar": "https://example.com/new-avatar.jpg",
  "preferences": {
    "theme": "dark",
    "language": "es"
  }
}
```

**Response**:
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Smith",
    "role": "manager",
    "avatar": "https://example.com/new-avatar.jpg",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-12-01T09:00:00Z"
  },
  "message": "User data updated successfully"
}
```

### 3. Get User Activity

**Endpoint**: `GET /api/user/activity`

**Description**: Retrieves user activity history with filtering and pagination.

**Query Parameters**:
- `limit` (number, optional): Number of activities to return (1-100, default: 20)
- `offset` (number, optional): Number of activities to skip (default: 0)
- `type` (string, optional): Filter by activity type (`all`, `projects`, `materials`, `files`, `notifications`)
- `startDate` (string, optional): Filter activities from this date (ISO 8601)
- `endDate` (string, optional): Filter activities until this date (ISO 8601)

**Example Request**:
```
GET /api/user/activity?limit=10&offset=0&type=projects&startDate=2024-11-01T00:00:00Z
```

**Response**:
```json
{
  "activities": [
    {
      "id": "1",
      "type": "project_created",
      "description": "Created new project \"Office Building Alpha\"",
      "timestamp": "2024-12-01T06:00:00Z",
      "metadata": {
        "projectId": "proj_123",
        "projectName": "Office Building Alpha"
      }
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

### 4. Get User Statistics

**Endpoint**: `GET /api/user/statistics`

**Description**: Retrieves comprehensive user performance statistics and metrics.

**Response**:
```json
{
  "projects": {
    "total": 15,
    "active": 8,
    "completed": 7,
    "planning": 2,
    "averageProgress": 75
  },
  "materials": {
    "total": 125,
    "lowStock": 8,
    "inStock": 117
  },
  "files": {
    "total": 45,
    "totalSize": "125.5 MB",
    "recentUploads": 3
  },
  "activity": {
    "thisWeek": 15,
    "thisMonth": 45,
    "lastLogin": "2024-12-01T08:00:00Z"
  },
  "performance": {
    "projectCompletionRate": 85,
    "averageProjectDuration": "45 days",
    "onTimeDelivery": "85%"
  }
}
```

### 5. Get User Preferences

**Endpoint**: `GET /api/user/preferences`

**Description**: Retrieves user preferences and settings.

**Response**:
```json
{
  "theme": "light",
  "language": "en",
  "timezone": "UTC",
  "dateFormat": "MM/DD/YYYY",
  "notifications": {
    "email": true,
    "push": true,
    "sms": false,
    "projectUpdates": true,
    "materialAlerts": true,
    "systemNotifications": false
  },
  "dashboard": {
    "layout": "grid",
    "widgets": ["projects", "materials", "notifications", "analytics"],
    "refreshInterval": 30000
  },
  "privacy": {
    "profileVisibility": "team",
    "activitySharing": true,
    "dataExport": true
  },
  "accessibility": {
    "highContrast": false,
    "fontSize": "medium",
    "screenReader": false
  }
}
```

### 6. Update User Preferences

**Endpoint**: `PUT /api/user/preferences`

**Description**: Updates user preferences and settings.

**Request Body**:
```json
{
  "theme": "dark",
  "language": "es",
  "notifications": {
    "email": false,
    "push": true,
    "sms": false
  },
  "dashboard": {
    "layout": "list",
    "widgets": ["projects", "materials"]
  }
}
```

**Response**:
```json
{
  "message": "Preferences updated successfully",
  "preferences": {
    "theme": "dark",
    "language": "es",
    "notifications": {
      "email": false,
      "push": true,
      "sms": false
    },
    "dashboard": {
      "layout": "list",
      "widgets": ["projects", "materials"]
    }
  }
}
```

## Data Models

### User Data Model

```typescript
interface UserData {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'manager' | 'user';
    avatar?: string;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
    isActive: boolean;
    preferences: UserPreferences;
    statistics: UserStatistics;
    permissions: UserPermissions;
  };
  recentActivity: UserActivity[];
  notifications: UserNotification[];
}
```

### User Activity Model

```typescript
interface UserActivity {
  id: string;
  type: 'project_created' | 'material_added' | 'file_uploaded' | 'notification_received' | 'login';
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
```

### User Statistics Model

```typescript
interface UserStatistics {
  projects: {
    total: number;
    active: number;
    completed: number;
    planning: number;
    averageProgress: number;
  };
  materials: {
    total: number;
    lowStock: number;
    inStock: number;
  };
  files: {
    total: number;
    totalSize: string;
    recentUploads: number;
  };
  activity: {
    thisWeek: number;
    thisMonth: number;
    lastLogin: string;
  };
  performance: {
    projectCompletionRate: number;
    averageProjectDuration: string;
    onTimeDelivery: string;
  };
}
```

### User Preferences Model

```typescript
interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    projectUpdates: boolean;
    materialAlerts: boolean;
    systemNotifications: boolean;
  };
  dashboard: {
    layout: 'grid' | 'list';
    widgets: string[];
    refreshInterval: number;
  };
  privacy: {
    profileVisibility: 'public' | 'team' | 'private';
    activitySharing: boolean;
    dataExport: boolean;
  };
  accessibility: {
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
    screenReader: boolean;
  };
}
```

## Error Handling

### Error Response Format

```json
{
  "message": "Error description",
  "errors": [
    {
      "message": "Field-specific error message",
      "field": "fieldName"
    }
  ]
}
```

### Common Error Codes

- **400 Bad Request**: Invalid request data or validation errors
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: User or resource not found
- **500 Internal Server Error**: Server-side error

### Validation Errors

When validation fails, the API returns detailed field-specific errors:

```json
{
  "errors": [
    {
      "message": "Name is required",
      "field": "name"
    },
    {
      "message": "Invalid avatar URL",
      "field": "avatar"
    }
  ]
}
```

## Usage Examples

### React Hook Usage

```typescript
import { useUserData } from '@/hooks/use-user-data';

function UserDashboard() {
  const {
    userData,
    activity,
    statistics,
    preferences,
    loading,
    error,
    getUserData,
    updateUserData,
    getUserActivity,
    getUserStatistics,
    getUserPreferences,
    updateUserPreferences
  } = useUserData();

  useEffect(() => {
    getUserData();
    getUserStatistics();
  }, []);

  const handleUpdatePreferences = async () => {
    try {
      await updateUserPreferences({
        theme: 'dark',
        notifications: {
          email: false,
          push: true,
          sms: false
        }
      });
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Welcome, {userData?.user.name}</h1>
      <p>Total Projects: {statistics?.projects.total}</p>
      <button onClick={handleUpdatePreferences}>
        Update Preferences
      </button>
    </div>
  );
}
```

### Direct API Usage

```typescript
import { api } from '@/lib/api';

// Get comprehensive user data
const userData = await api.getUserData();
console.log('User:', userData.user);
console.log('Recent Activity:', userData.recentActivity);

// Get filtered activity
const activity = await api.getUserActivity({
  limit: 20,
  type: 'projects',
  startDate: '2024-11-01T00:00:00Z'
});

// Update user preferences
await api.updateUserPreferences({
  theme: 'dark',
  notifications: {
    email: false,
    push: true
  }
});

// Get user statistics
const stats = await api.getUserStatistics();
console.log('Project completion rate:', stats.performance.projectCompletionRate);
```

### Error Handling Example

```typescript
try {
  const userData = await api.getUserData();
  // Handle success
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        // Redirect to login
        break;
      case 403:
        // Show access denied message
        break;
      case 404:
        // Show user not found message
        break;
      default:
        // Show generic error message
        console.error('API Error:', error.message);
    }
  } else {
    // Handle network or other errors
    console.error('Unexpected error:', error);
  }
}
```

## Rate Limiting

User data endpoints are subject to the standard API rate limiting:
- **General API Rate Limit**: 100 requests per minute per IP
- **Authentication Rate Limit**: 5 requests per 15 minutes per IP
- **Upload Rate Limit**: 10 requests per 5 minutes per IP

## Caching

User data endpoints implement intelligent caching:
- **User Profile Data**: Cached for 30 seconds
- **User Statistics**: Cached for 5 minutes
- **User Activity**: Cached for 1 minute
- **User Preferences**: Cached for 30 seconds

## Security Considerations

1. **Authentication Required**: All endpoints require valid JWT tokens
2. **Data Isolation**: Users can only access their own data
3. **Input Validation**: All inputs are validated and sanitized
4. **Rate Limiting**: Prevents abuse and ensures fair usage
5. **Audit Logging**: All user data access is logged for security

This comprehensive User Data API provides a robust foundation for user management and personalization features in the Construction Success Platform.
