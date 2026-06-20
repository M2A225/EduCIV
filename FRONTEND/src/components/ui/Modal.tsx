import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={cn(
        'relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-bg-elevated border border-border rounded-2xl shadow-4 animate-scale-in',
        className
      )}>
        {title && (
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            <h2 className="text-lg font-heading font-bold text-text">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface transition-colors cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-5 h-5 text-text-muted" />
            </button>
          </div>
        )}
        <div className="p-6 pt-2">{children}</div>
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-surface transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        )}
      </div>
    </div>
  );
}
