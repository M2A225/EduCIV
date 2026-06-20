import React from 'react';
import { cn } from '../../lib/utils';
import { Badge } from './Badge';

interface StatusBadgeProps {
  status: string;
  variant: 'green' | 'red' | 'yellow' | 'gray' | 'blue' | 'orange';
  children?: React.ReactNode;
}

const variantMap: Record<string, 'success' | 'error' | 'warning' | 'default' | 'info' | 'primary'> = {
  green: 'success',
  red: 'error',
  yellow: 'warning',
  gray: 'default',
  blue: 'info',
  orange: 'primary',
};

export function StatusBadge({ status, variant, children }: StatusBadgeProps) {
  return (
    <Badge variant={variantMap[variant] || 'default'}>
      {children || status}
    </Badge>
  );
}
