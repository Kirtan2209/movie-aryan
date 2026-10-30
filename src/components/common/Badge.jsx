import React from 'react';

export const Badge = ({ children, variant = 'glass', size = 'sm', className = '' }) => {
  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 tracking-wider',
    sm: 'text-xs px-2.5 py-0.5 tracking-wide',
    md: 'text-sm px-3 py-1 font-medium'
  };

  const variantClasses = {
    glass: 'bg-white/[0.08] text-white/90 border border-white/15 backdrop-blur-md',
    gold: 'bg-[#E5A93C]/15 text-[#f6ca77] border border-[#E5A93C]/40 shadow-sm shadow-[#E5A93C]/20',
    cyan: 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/30',
    crimson: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    solid: 'bg-white text-black font-bold',
    charcoal: 'bg-[#181A22] text-slate-300 border border-white/10'
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-md font-semibold uppercase select-none transition-colors ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
