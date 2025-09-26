import { toast } from '@/hooks/use-toast';
import { logError as logErrorToService } from './error-logger';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: any;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    status: number = 500,
    details?: any,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, AppError);
  }
}

export const ErrorCodes = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  CONNECTION_REFUSED: 'CONNECTION_REFUSED',
  
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Business logic errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  
  // System errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

export const ErrorMessages = {
  [ErrorCodes.NETWORK_ERROR]: 'Unable to connect to the server. Please check your internet connection.',
  [ErrorCodes.TIMEOUT]: 'The request timed out. Please try again.',
  [ErrorCodes.CONNECTION_REFUSED]: 'Connection refused. The server may be down.',
  [ErrorCodes.UNAUTHORIZED]: 'You are not authorized to perform this action.',
  [ErrorCodes.FORBIDDEN]: 'Access denied. You do not have permission to access this resource.',
  [ErrorCodes.TOKEN_EXPIRED]: 'Your session has expired. Please log in again.',
  [ErrorCodes.INVALID_CREDENTIALS]: 'Invalid username or password.',
  [ErrorCodes.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorCodes.INVALID_INPUT]: 'The provided input is invalid.',
  [ErrorCodes.MISSING_REQUIRED_FIELD]: 'Please fill in all required fields.',
  [ErrorCodes.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCodes.ALREADY_EXISTS]: 'This resource already exists.',
  [ErrorCodes.INSUFFICIENT_PERMISSIONS]: 'You do not have sufficient permissions for this action.',
  [ErrorCodes.QUOTA_EXCEEDED]: 'You have exceeded your quota limit.',
  [ErrorCodes.INTERNAL_ERROR]: 'An internal error occurred. Please try again later.',
  [ErrorCodes.SERVICE_UNAVAILABLE]: 'The service is temporarily unavailable.',
  [ErrorCodes.DATABASE_ERROR]: 'A database error occurred. Please try again.',
  [ErrorCodes.EXTERNAL_SERVICE_ERROR]: 'An external service error occurred. Please try again.',
} as const;

export function getErrorMessage(error: any): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error?.code && ErrorMessages[error.code as ErrorCode]) {
    return ErrorMessages[error.code as ErrorCode];
  }

  if (error?.message) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred. Please try again.';
}

export function getErrorCode(error: any): string {
  if (error instanceof AppError) {
    return error.code;
  }

  if (error?.code) {
    return error.code;
  }

  return ErrorCodes.INTERNAL_ERROR;
}

export function isOperationalError(error: any): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }

  // Network errors are typically operational
  if (error?.code && (
    error.code === ErrorCodes.NETWORK_ERROR ||
    error.code === ErrorCodes.TIMEOUT ||
    error.code === ErrorCodes.CONNECTION_REFUSED ||
    error.code === ErrorCodes.UNAUTHORIZED ||
    error.code === ErrorCodes.FORBIDDEN ||
    error.code === ErrorCodes.TOKEN_EXPIRED ||
    error.code === ErrorCodes.VALIDATION_ERROR ||
    error.code === ErrorCodes.NOT_FOUND ||
    error.code === ErrorCodes.ALREADY_EXISTS ||
    error.code === ErrorCodes.INSUFFICIENT_PERMISSIONS ||
    error.code === ErrorCodes.QUOTA_EXCEEDED ||
    error.code === ErrorCodes.INVALID_CREDENTIALS
  )) {
    return true;
  }

  return false;
}

export function handleError(error: any, options?: {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}): string {
  const {
    showToast = true,
    logError = true,
    fallbackMessage = 'An unexpected error occurred. Please try again.'
  } = options || {};

  const message = getErrorMessage(error);
  const code = getErrorCode(error);
  const isOperational = isOperationalError(error);

  // Log error for debugging
  if (logError) {
    console.error('Error handled:', {
      message,
      code,
      isOperational,
      originalError: error,
      stack: error?.stack
    });

    // Log to error tracking service
    logErrorToService(
      error instanceof Error ? error : new Error(message),
      'error-handler',
      'handleError',
      {
        code,
        isOperational,
        showToast,
        fallbackMessage
      }
    );
  }

  // Show toast notification
  if (showToast) {
    toast({
      title: isOperational ? 'Error' : 'System Error',
      description: message,
      variant: isOperational ? 'destructive' : 'destructive',
    });
  }

  return message;
}

export function createApiError(
  message: string,
  code: ErrorCode = ErrorCodes.INTERNAL_ERROR,
  status: number = 500,
  details?: any
): AppError {
  return new AppError(message, code, status, details, true);
}

export function createValidationError(
  message: string,
  details?: any
): AppError {
  return new AppError(message, ErrorCodes.VALIDATION_ERROR, 400, details, true);
}

export function createNotFoundError(
  message: string = 'Resource not found',
  details?: any
): AppError {
  return new AppError(message, ErrorCodes.NOT_FOUND, 404, details, true);
}

export function createUnauthorizedError(
  message: string = 'Unauthorized access',
  details?: any
): AppError {
  return new AppError(message, ErrorCodes.UNAUTHORIZED, 401, details, true);
}

export function createForbiddenError(
  message: string = 'Access forbidden',
  details?: any
): AppError {
  return new AppError(message, ErrorCodes.FORBIDDEN, 403, details, true);
}

// Utility function to wrap async functions with error handling
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options?: {
    showToast?: boolean;
    logError?: boolean;
    fallbackMessage?: string;
  }
) {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, options);
      return null;
    }
  };
}

// Utility function to wrap sync functions with error handling
export function withSyncErrorHandling<T extends any[], R>(
  fn: (...args: T) => R,
  options?: {
    showToast?: boolean;
    logError?: boolean;
    fallbackMessage?: string;
  }
) {
  return (...args: T): R | null => {
    try {
      return fn(...args);
    } catch (error) {
      handleError(error, options);
      return null;
    }
  };
}
