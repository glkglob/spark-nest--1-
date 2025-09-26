import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, X, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ErrorDisplayProps {
  error: string | Error | null;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'warning' | 'info';
  showRetry?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  title,
  description,
  variant = 'destructive',
  showRetry = false,
  onRetry,
  onDismiss,
  className,
  size = 'md'
}) => {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;
  const displayTitle = title || 'Something went wrong';
  const displayDescription = description || errorMessage;

  const getIcon = () => {
    switch (variant) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      case 'destructive':
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  if (size === 'lg') {
    return (
      <Card className={cn('border-red-200 bg-red-50', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-red-800">{displayTitle}</CardTitle>
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="ml-auto h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 mb-4">{displayDescription}</p>
          {showRetry && onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Alert variant={variant} className={cn(getSizeClasses(), className)}>
      <div className="flex items-start gap-2">
        {getIcon()}
        <div className="flex-1">
          <AlertDescription>
            <div className="font-medium">{displayTitle}</div>
            <div className="mt-1">{displayDescription}</div>
          </AlertDescription>
        </div>
        <div className="flex items-center gap-2">
          {showRetry && onRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="h-6 px-2"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
};

export default ErrorDisplay;
