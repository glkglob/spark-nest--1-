import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { AuthService } from './auth-service';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  userId: string;
  projectId?: number;
  materialId?: number;
  timestamp: string;
  read: boolean;
}

export class NotificationService {
  private io: SocketIOServer;
  private notifications: Map<string, Notification[]> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Authenticate user
      socket.on('authenticate', async (token: string) => {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production') as any;
          const user = await AuthService.findUserById(decoded.userId);
          
          if (user) {
            socket.join(`user:${decoded.userId}`);
            console.log(`User ${decoded.userId} authenticated and joined room`);
            
            // Send any pending notifications
            const userNotifications = this.getUserNotifications(decoded.userId);
            socket.emit('notifications', userNotifications);
          } else {
            socket.disconnect();
          }
        } catch (error) {
          console.error('Authentication error:', error);
          socket.disconnect();
        }
      });

      socket.on('markAsRead', (notificationId: string) => {
        const userId = this.getUserIdFromSocket(socket);
        if (userId) {
          this.markNotificationAsRead(userId, notificationId);
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  private getUserIdFromSocket(socket: any): string | null {
    // This is a simplified approach - in production, you'd store this in the socket
    const rooms = Array.from(socket.rooms);
    const userRoom = rooms.find((room: string) => room.startsWith('user:'));
    return userRoom ? (userRoom as string).replace('user:', '') : null;
  }

  public createNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false,
    };

    // Store notification
    const userNotifications = this.getUserNotifications(notification.userId);
    userNotifications.unshift(newNotification);
    
    // Keep only last 50 notifications per user
    if (userNotifications.length > 50) {
      userNotifications.splice(50);
    }

    // Send real-time notification
    this.io.to(`user:${notification.userId}`).emit('new-notification', newNotification);

    return newNotification;
  }

  public getUserNotifications(userId: string): Notification[] {
    return this.notifications.get(userId) || [];
  }

  public markNotificationAsRead(userId: string, notificationId: string) {
    const userNotifications = this.getUserNotifications(userId);
    const notification = userNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.io.to(`user:${userId}`).emit('notification-updated', notification);
    }
  }

  public markAllAsRead(userId: string) {
    const userNotifications = this.getUserNotifications(userId);
    userNotifications.forEach(n => n.read = true);
    this.io.to(`user:${userId}`).emit('notifications', userNotifications);
  }

  // Project-related notifications
  public notifyProjectCreated(userId: string, projectName: string, projectId: number) {
    return this.createNotification({
      type: 'success',
      title: 'Project Created',
      message: `Project "${projectName}" has been created successfully.`,
      userId,
      projectId,
    });
  }

  public notifyProjectUpdated(userId: string, projectName: string, projectId: number) {
    return this.createNotification({
      type: 'info',
      title: 'Project Updated',
      message: `Project "${projectName}" has been updated.`,
      userId,
      projectId,
    });
  }

  public notifyProjectDeleted(userId: string, projectName: string) {
    return this.createNotification({
      type: 'warning',
      title: 'Project Deleted',
      message: `Project "${projectName}" has been deleted.`,
      userId,
    });
  }

  public notifyProjectProgress(userId: string, projectName: string, progress: number, projectId: number) {
    return this.createNotification({
      type: 'info',
      title: 'Progress Update',
      message: `Project "${projectName}" is now ${progress}% complete.`,
      userId,
      projectId,
    });
  }

  // Material-related notifications
  public notifyMaterialLowStock(userId: string, materialName: string, projectName: string, projectId: number, materialId: number) {
    return this.createNotification({
      type: 'warning',
      title: 'Low Stock Alert',
      message: `Material "${materialName}" in project "${projectName}" is running low.`,
      userId,
      projectId,
      materialId,
    });
  }

  public notifyMaterialCriticalStock(userId: string, materialName: string, projectName: string, projectId: number, materialId: number) {
    return this.createNotification({
      type: 'error',
      title: 'Critical Stock Alert',
      message: `Material "${materialName}" in project "${projectName}" is critically low!`,
      userId,
      projectId,
      materialId,
    });
  }

  public notifyMaterialAdded(userId: string, materialName: string, projectName: string, projectId: number, materialId: number) {
    return this.createNotification({
      type: 'success',
      title: 'Material Added',
      message: `Material "${materialName}" has been added to project "${projectName}".`,
      userId,
      projectId,
      materialId,
    });
  }

  // System notifications
  public notifySystemMessage(userId: string, title: string, message: string) {
    return this.createNotification({
      type: 'info',
      title,
      message,
      userId,
    });
  }

  public notifyWelcome(userId: string, userName: string) {
    return this.createNotification({
      type: 'success',
      title: 'Welcome!',
      message: `Welcome to Construction Success, ${userName}! Start by creating your first project.`,
      userId,
    });
  }
}
