import { cn } from '@/lib/utils';

const variantStyles: Record<string, string> = {
  default: 'bg-surface text-text border border-border',
  primary: 'bg-primary/10 text-primary border border-primary/20',
  success: 'bg-success-bg text-success border border-success/20',
  warning: 'bg-warning-bg text-warning border border-warning/20',
  error: 'bg-error-bg text-error border border-error/20',
  info: 'bg-info-bg text-info border border-info/20',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof variantStyles;
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variantStyles[variant],
      className
    )}>
      {children}
    </span>
  );
}
