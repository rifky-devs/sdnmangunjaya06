import React from 'react';

const getInitials = (name) => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export default function Avatar({ photoUrl, name, size = 'sm', className = '' }) {
  const sizeClasses = {
    sm: 'h-10 w-10 text-xs font-bold border',
    md: 'h-20 w-20 text-xl font-bold border-2',
    lg: 'h-24 w-24 text-2xl font-black border-2'
  };

  const selectedSize = sizeClasses[size] || sizeClasses.sm;

  return (
    <div className={`relative flex items-center justify-center rounded-full bg-slate-50 overflow-hidden border-slate-200/80 shadow-sm shrink-0 ${selectedSize} ${className}`}>
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={name || 'User Profile'}
          className="h-full w-full object-cover"
          onError={(e) => {
            // Failback if image fails to load
            e.target.style.display = 'none';
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-teal-600 font-bold text-white uppercase select-none">
          {getInitials(name || 'U')}
        </div>
      )}
    </div>
  );
}
