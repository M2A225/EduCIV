import React, { useState, useMemo, useRef } from 'react';
import { Input } from './Input';

interface AutocompleteItem {
  id: number | string;
  label: string;
  subtitle?: string;
}

interface AutocompleteProps {
  items: AutocompleteItem[];
  value: string;
  onChange: (value: string, item?: AutocompleteItem) => void;
  placeholder?: string;
  required?: boolean;
}

export default function Autocomplete({ items, value, onChange, placeholder = 'Rechercher...', required }: AutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query) return items;
    return items.filter((item) =>
      item.label.toLowerCase().includes(query.toLowerCase())
    );
  }, [items, query]);

  const handleSelect = (item: AutocompleteItem) => {
    setQuery(item.label);
    onChange(item.label, item);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder={placeholder}
        required={required}
      />
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-primary/10 rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              className="w-full text-left px-4 py-2 text-sm hover:bg-primary/5 transition-colors"
              onMouseDown={() => handleSelect(item)}
            >
              <span className="font-medium">{item.label}</span>
              {item.subtitle && (
                <span className="text-text/40 ml-2 text-xs">{item.subtitle}</span>
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-4 py-2 text-text/40 text-sm">Aucun résultat</p>
          )}
        </div>
      )}
    </div>
  );
};
