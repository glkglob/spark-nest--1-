import { useState, useCallback } from 'react';
import { logError, logInfo } from '@/lib/error-logger';

export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  exponentialBackoff?: boolean;
  onRetry?: (attempt: number) => void;
  onSuccess?: () => void;
  onFailure?: (error: Error) => void;
}

export interface RetryState {
  isRetrying: boolean;
  attempt: number;
  maxAttempts: number;
  lastError: Error | null;
}

export function useRetry(options: RetryOptions = {}) {
  const {
    maxAttempts = 3,
    delay = 1000,
    exponentialBackoff = true,
    onRetry,
    onSuccess,
    onFailure
  } = options;

  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    attempt: 0,
    maxAttempts,
    lastError: null
  });

  const calculateDelay = useCallback((attempt: number) => {
    if (!exponentialBackoff) return delay;
    return delay * Math.pow(2, attempt - 1);
  }, [delay, exponentialBackoff]);

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string = 'operation'
  ): Promise<T> => {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        setState(prev => ({
          ...prev,
          isRetrying: attempt > 1,
          attempt,
          lastError: null
        }));

        if (attempt > 1) {
          const retryDelay = calculateDelay(attempt - 1);
          logInfo(`Retrying ${operationName} (attempt ${attempt}/${maxAttempts})`, 'useRetry', 'retry', {
            attempt,
            delay: retryDelay,
            operationName
          });
          
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          onRetry?.(attempt);
        }

        const result = await operation();
        
        setState(prev => ({
          ...prev,
          isRetrying: false,
          attempt: 0,
          lastError: null
        }));

        onSuccess?.();
        logInfo(`${operationName} succeeded on attempt ${attempt}`, 'useRetry', 'success', {
          attempt,
          operationName
        });

        return result;
      } catch (error) {
        lastError = error as Error;
        setState(prev => ({
          ...prev,
          lastError: lastError
        }));

        logError(lastError, 'useRetry', 'attempt', {
          attempt,
          maxAttempts,
          operationName
        });

        if (attempt === maxAttempts) {
          setState(prev => ({
            ...prev,
            isRetrying: false
          }));
          
          onFailure?.(lastError);
          throw lastError;
        }
      }
    }

    throw lastError || new Error('Retry failed');
  }, [maxAttempts, calculateDelay, onRetry, onSuccess, onFailure]);

  const reset = useCallback(() => {
    setState({
      isRetrying: false,
      attempt: 0,
      maxAttempts,
      lastError: null
    });
  }, [maxAttempts]);

  return {
    executeWithRetry,
    reset,
    ...state
  };
}

export default useRetry;
