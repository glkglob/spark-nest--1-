/**
 * Error Logging Service
 * Centralized error logging and monitoring for the application
 */

import { AppError, ErrorCodes } from './error-handler';

export interface ErrorLogEntry {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  code: string;
  stack?: string;
  userId?: string;
  sessionId: string;
  url: string;
  userAgent: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByCode: Record<string, number>;
  errorsByComponent: Record<string, number>;
  recentErrors: ErrorLogEntry[];
  errorRate: number; // errors per hour
}

class ErrorLogger {
  private logs: ErrorLogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 errors in memory
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const err = new Error(`Unhandled Promise Rejection`);
      (err as any).reason = event.reason;
      this.logError(err, 'unhandled_promise_rejection', 'promise', {
        reason: String(event.reason),
        hasPromise: !!event.promise
      });
    });

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      const err = new Error(event.message);
      this.logError(err, 'global_error', 'window_error', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        hasError: !!event.error
      });
    });
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  logError(
    error: Error | AppError,
    component?: string,
    action?: string,
    metadata?: Record<string, any>
  ): void {
    const logEntry: ErrorLogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      level: 'error',
      message: error.message,
      code: error instanceof AppError ? error.code : ErrorCodes.INTERNAL_ERROR,
      stack: error.stack,
      userId: this.userId,
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      component,
      action,
      metadata
    };

    // Add to in-memory logs
    this.logs.unshift(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', logEntry);
    }

    // Send to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(logEntry);
    }
  }

  logWarning(
    message: string,
    component?: string,
    action?: string,
    metadata?: Record<string, any>
  ): void {
    const logEntry: ErrorLogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      level: 'warning',
      message,
      code: 'WARNING',
      userId: this.userId,
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      component,
      action,
      metadata
    };

    this.logs.unshift(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    if (process.env.NODE_ENV === 'development') {
      console.warn('Warning logged:', logEntry);
    }

    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(logEntry);
    }
  }

  logInfo(
    message: string,
    component?: string,
    action?: string,
    metadata?: Record<string, any>
  ): void {
    const logEntry: ErrorLogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      code: 'INFO',
      userId: this.userId,
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      component,
      action,
      metadata
    };

    this.logs.unshift(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    if (process.env.NODE_ENV === 'development') {
      console.info('Info logged:', logEntry);
    }
  }

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async sendToExternalService(logEntry: ErrorLogEntry): Promise<void> {
    try {
      // In a real application, you would send this to an error tracking service
      // like Sentry, LogRocket, Bugsnag, or your own logging service
      
      // Example: Sentry.captureException(error, { extra: logEntry });
      // Example: LogRocket.captureException(error);
      // Example: Bugsnag.notify(error, { metaData: logEntry });
      
      // For now, we'll just log to console in production
      console.error('Production error (would be sent to external service):', logEntry);
      
      // You could also send to your own API endpoint
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(logEntry)
      // });
    } catch (error) {
      console.error('Failed to send error to external service:', error);
    }
  }

  getLogs(limit: number = 50): ErrorLogEntry[] {
    return this.logs.slice(0, limit);
  }

  getMetrics(): ErrorMetrics {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const recentErrors = this.logs.filter(log => 
      new Date(log.timestamp) > oneHourAgo
    );

    const errorsByCode: Record<string, number> = {};
    const errorsByComponent: Record<string, number> = {};

    this.logs.forEach(log => {
      errorsByCode[log.code] = (errorsByCode[log.code] || 0) + 1;
      if (log.component) {
        errorsByComponent[log.component] = (errorsByComponent[log.component] || 0) + 1;
      }
    });

    return {
      totalErrors: this.logs.length,
      errorsByCode,
      errorsByComponent,
      recentErrors: recentErrors.slice(0, 10),
      errorRate: recentErrors.length
    };
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Create singleton instance
export const errorLogger = new ErrorLogger();

// Export convenience functions
export const logError = (
  error: Error | AppError,
  component?: string,
  action?: string,
  metadata?: Record<string, any>
) => errorLogger.logError(error, component, action, metadata);

export const logWarning = (
  message: string,
  component?: string,
  action?: string,
  metadata?: Record<string, any>
) => errorLogger.logWarning(message, component, action, metadata);

export const logInfo = (
  message: string,
  component?: string,
  action?: string,
  metadata?: Record<string, any>
) => errorLogger.logInfo(message, component, action, metadata);

export const setUserId = (userId: string) => errorLogger.setUserId(userId);

export const getErrorMetrics = () => errorLogger.getMetrics();

export const getErrorLogs = (limit?: number) => errorLogger.getLogs(limit);
