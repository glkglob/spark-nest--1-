import { useState, useCallback } from 'react';
import { handleError, AppError, ErrorCodes } from '@/lib/error-handler';
import { logError, logInfo } from '@/lib/error-logger';
import { toast } from '@/hooks/use-toast';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  component?: string;
  action?: string;
  onError?: (error: Error) => void;
  onRecovery?: () => void;
}

export interface ErrorState {
  error: string | null;
  isError: boolean;
  errorCode: string | null;
  isOperational: boolean;
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const {
    showToast = true,
    logError: shouldLogError = true,
    component,
    action,
    onError,
    onRecovery
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
    errorCode: null,
    isOperational: false
  });

  const handleErrorWithState = useCallback((error: any, customOptions?: Partial<ErrorHandlerOptions>) => {
    const mergedOptions = { ...options, ...customOptions };
    
    try {
      const errorMessage = handleError(error, {
        showToast: mergedOptions.showToast,
        logError: mergedOptions.logError
      });

      const errorCode = error instanceof AppError ? error.code : ErrorCodes.INTERNAL_ERROR;
      const isOperational = error instanceof AppError ? error.isOperational : false;

      setErrorState({
        error: errorMessage,
        isError: true,
        errorCode,
        isOperational
      });

      // Log error with component context
      if (mergedOptions.logError !== false) {
        logError(
          error instanceof Error ? error : new Error(errorMessage),
          component,
          action,
          {
            errorCode,
            isOperational,
            showToast: mergedOptions.showToast
          }
        );
      }

      // Call custom error handler
      onError?.(error instanceof Error ? error : new Error(errorMessage));

      return errorMessage;
    } catch (handlerError) {
      console.error('Error in error handler:', handlerError);
      return 'An unexpected error occurred';
    }
  }, [options, component, action, onError]);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isError: false,
      errorCode: null,
      isOperational: false
    });
    
    onRecovery?.();
    
    if (component) {
      logInfo('Error cleared', component, 'clearError');
    }
  }, [component, onRecovery]);

  const handleAsyncError = useCallback(async <T>(
    operation: () => Promise<T>,
    customOptions?: Partial<ErrorHandlerOptions>
  ): Promise<T | null> => {
    try {
      clearError();
      const result = await operation();
      return result;
    } catch (error) {
      handleErrorWithState(error, customOptions);
      return null;
    }
  }, [handleErrorWithState, clearError]);

  const showSuccessToast = useCallback((message: string, title?: string) => {
    toast({
      title: title || 'Success',
      description: message,
      variant: 'default'
    });
  }, []);

  const showWarningToast = useCallback((message: string, title?: string) => {
    toast({
      title: title || 'Warning',
      description: message,
      variant: 'destructive'
    });
  }, []);

  const showInfoToast = useCallback((message: string, title?: string) => {
    toast({
      title: title || 'Info',
      description: message,
      variant: 'default'
    });
  }, []);

  return {
    ...errorState,
    handleError: handleErrorWithState,
    handleAsyncError,
    clearError,
    showSuccessToast,
    showWarningToast,
    showInfoToast
  };
}

export default useErrorHandler;
