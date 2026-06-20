import { type ReactNode } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './Input';
import { Button } from './Button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
  children?: ReactNode;
}

export function SearchBar({
  value, onChange, placeholder = 'Rechercher...',
  showFilters, onToggleFilters, hasActiveFilters, onResetFilters, children,
}: SearchBarProps) {
  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/40 pointer-events-none" />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="pl-10 h-10"
          />
        </div>
        {onToggleFilters && (
          <Button
            variant={showFilters ? 'primary' : 'glass'}
            onClick={onToggleFilters}
            className="whitespace-nowrap"
          >
            Filtres
          </Button>
        )}
        {hasActiveFilters && onResetFilters && (
          <Button variant="outline" onClick={onResetFilters} className="whitespace-nowrap">
            <X className="w-4 h-4 mr-1" /> Réinitialiser
          </Button>
        )}
      </div>
      {showFilters && children && (
        <div className="mt-4 pt-4 border-t border-primary/10">
          {children}
        </div>
      )}
    </div>
  );
}
