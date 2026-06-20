import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
  page: number;
  total: number;
  onChange: (page: number) => void;
  pageSize?: number;
}

export function Pagination({ page, total, onChange, pageSize = 50 }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <Button
        variant="glass"
        size="sm"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Page précédente"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <span className="text-sm text-text/60 px-3">
        {page} / {totalPages}
      </span>
      <Button
        variant="glass"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="Page suivante"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
