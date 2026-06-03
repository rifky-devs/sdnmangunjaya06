import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchInput({ 
  value = '', 
  onChange, 
  placeholder = 'Cari...', 
  className = '', 
  id = 'search-input' 
}) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4.5 text-slate-400">
        <Search size={16} />
      </div>
      <input
        type="text"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-11 pr-10 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
