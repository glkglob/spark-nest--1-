import { RequestHandler } from "express";
import { AuthService } from "../lib/auth-service";

export type UserRole = 'admin' | 'manager' | 'user';

// Role-based access control middleware
export const requireRole = (allowedRoles: UserRole[]): RequestHandler => {
  return async (req, res, next) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const user = await AuthService.findUserById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const userRole = 'role' in user ? user.role : 'user';
      
      if (!allowedRoles.includes(userRole as UserRole)) {
        return res.status(403).json({ 
          message: 'Insufficient permissions',
          required: allowedRoles,
          current: userRole
        });
      }

      // Add user role to request for use in other middleware/routes
      req.userRole = userRole as UserRole;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};

// Permission-based access control
export const requirePermission = (permission: string): RequestHandler => {
  return async (req, res, next) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const user = await AuthService.findUserById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const userRole = 'role' in user ? user.role : 'user';
      
      // Define permissions for each role
      const permissions: Record<UserRole, string[]> = {
        admin: [
          'read:all',
          'write:all',
          'delete:all',
          'manage:users',
          'manage:projects',
          'manage:materials',
          'manage:analytics',
          'manage:system'
        ],
        manager: [
          'read:all',
          'write:projects',
          'write:materials',
          'delete:projects',
          'delete:materials',
          'manage:projects',
          'manage:materials',
          'read:analytics'
        ],
        user: [
          'read:own',
          'write:own',
          'delete:own'
        ]
      };

      const userPermissions = permissions[userRole as UserRole] || permissions.user;
      
      if (!userPermissions.includes(permission)) {
        return res.status(403).json({ 
          message: 'Insufficient permissions',
          required: permission,
          current: userPermissions
        });
      }

      req.userRole = userRole as UserRole;
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};

// Resource ownership check middleware
export const requireOwnership = (resourceType: 'project' | 'material'): RequestHandler => {
  return async (req, res, next) => {
    try {
      const userId = req.userId;
      const resourceId = req.params.id || req.params.projectId || req.params.materialId;
      
      if (!userId || !resourceId) {
        return res.status(400).json({ message: 'Missing user ID or resource ID' });
      }

      // For admin users, skip ownership check
      const user = await AuthService.findUserById(userId);
      if (user && 'role' in user && user.role === 'admin') {
        return next();
      }

      // Check ownership based on resource type
      if (resourceType === 'project') {
        const { ProjectsService } = await import('../lib/projects-service');
        const project = await ProjectsService.getProjectById(parseInt(resourceId), userId);
        if (!project) {
          return res.status(404).json({ message: 'Project not found or access denied' });
        }
      } else if (resourceType === 'material') {
        const { ProjectsService } = await import('../lib/projects-service');
        const materialId = parseInt(resourceId);
        const material = await ProjectsService.getProjectMaterials(materialId, userId);
        if (!material || material.length === 0) {
          return res.status(404).json({ message: 'Material not found or access denied' });
        }
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};

// Extend Request interface to include userRole
declare global {
  namespace Express {
    interface Request {
      userRole?: UserRole;
    }
  }
}
