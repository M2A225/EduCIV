import React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={cn('skeleton', className)} />;
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex justify-center p-4', className)}>
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="bg-error-bg text-error p-4 rounded-xl border border-error/20 font-medium text-sm">
      {message}
    </div>
  );
}

interface FeedbackProps {
  type: 'error' | 'success' | 'warning';
  message: string;
  onRetry?: () => void;
}

const STYLES = {
  error: 'bg-error-bg text-error border-error/20',
  success: 'bg-success-bg text-success border-success/20',
  warning: 'bg-warning-bg text-warning border-warning/20',
} as const;

export function Feedback({ type, message, onRetry }: FeedbackProps) {
  return (
    <div className={`${STYLES[type]} p-4 rounded-xl border font-medium text-sm flex justify-between items-center animate-slide-up`}>
      <span>{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="underline text-sm ml-4 shrink-0">
          Réessayer
        </button>
      )}
    </div>
  );
}
