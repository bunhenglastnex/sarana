'use client';

import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface SearchBarProps {
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value = '',
  onChange,
  placeholder = 'What would you like to eat?',
}) => {
  return (
    <section className="flex items-center gap-space-xs mb-space-md">
      <div className="flex-1 flex items-center bg-surface-container-lowest rounded-full px-4 py-2.5 shadow-sm border border-surface-container/60 focus-within:ring-2 focus-within:ring-primary/30 transition-all">
        <Search className="w-5 h-5 text-outline mr-2 flex-shrink-0" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent font-sans text-sm text-on-surface placeholder:text-outline focus:outline-none"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange?.('')}
            className="p-1 rounded-full text-outline hover:text-on-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </section>
  );
};
