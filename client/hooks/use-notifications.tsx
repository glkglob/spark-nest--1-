import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

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

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  socket: Socket | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (token && user) {
      // Initialize Socket.IO connection
      const newSocket = io(process.env.NODE_ENV === 'production' 
        ? 'https://fusion-starter-1758821892.netlify.app' 
        : 'http://localhost:8080', {
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Connected to notifications server');
        newSocket.emit('authenticate', token);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from notifications server');
      });

      newSocket.on('notifications', (notifications: Notification[]) => {
        setNotifications(notifications);
      });

      newSocket.on('new-notification', (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
        
        // Show toast notification
        switch (notification.type) {
          case 'success':
            toast.success(notification.title, { description: notification.message });
            break;
          case 'warning':
            toast.warning(notification.title, { description: notification.message });
            break;
          case 'error':
            toast.error(notification.title, { description: notification.message });
            break;
          default:
            toast.info(notification.title, { description: notification.message });
        }
      });

      newSocket.on('notification-updated', (notification: Notification) => {
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? notification : n)
        );
      });

      setSocket(newSocket);

      // Fetch initial notifications
      fetchNotifications();

      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, [token, user]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    socket,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
