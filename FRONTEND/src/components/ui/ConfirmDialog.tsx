import React from 'react';
import { Button } from './Button';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirmer', cancelLabel = 'Annuler', variant = 'danger', loading, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-bg-elevated border border-border rounded-2xl shadow-4 animate-scale-in">
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${variant === 'danger' ? 'bg-error-bg' : 'bg-primary/10'}`}>
              <AlertTriangle className={`w-5 h-5 ${variant === 'danger' ? 'text-error' : 'text-primary'}`} />
            </div>
            <h2 className="text-lg font-heading font-bold text-text">{title}</h2>
          </div>
          <button onClick={onCancel} className="p-1 rounded-lg hover:bg-surface transition-colors cursor-pointer">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>
        <div className="p-6 pt-4">
          <p className="text-sm text-text-secondary mb-6">{message}</p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={onCancel}>{cancelLabel}</Button>
            <Button
              variant={variant === 'danger' ? 'primary' : 'primary'}
              className={variant === 'danger' ? 'bg-error hover:bg-error-hover shadow-error/20' : ''}
              isLoading={loading}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
