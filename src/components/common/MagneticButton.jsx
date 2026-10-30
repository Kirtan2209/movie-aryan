import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { soundFx } from '../../utils/sound';

export const MagneticButton = ({
  children,
  className = '',
  onClick,
  disabled = false,
  variant = 'primary', // 'primary' | 'secondary' | 'glass' | 'ghost' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  type = 'button',
  ...props
}) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (disabled || typeof window === 'undefined') return;
    // Only apply magnetic pull on non-touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const { clientX, clientY } = e;
    const { width, height, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.18, y: middleY * 0.18 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    soundFx.playHover();
  };

  const handleClick = (e) => {
    if (disabled) return;
    soundFx.playClick();
    if (onClick) onClick(e);
  };

  const baseStyles = 'relative inline-flex items-center justify-center font-medium rounded-xl select-none transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A93C] overflow-hidden group';

  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2.5 font-semibold'
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-[#E5A93C] via-[#F5BA42] to-[#E5A93C] text-[#060709] font-bold shadow-lg shadow-[#E5A93C]/25 hover:shadow-[#E5A93C]/40 hover:brightness-110 active:scale-95',
    secondary:
      'bg-white/10 hover:bg-white/15 text-white border border-white/15 backdrop-blur-md shadow-lg shadow-black/40 hover:border-white/30 active:scale-95',
    glass:
      'bg-slate-900/60 hover:bg-slate-800/80 text-white border border-white/10 hover:border-[#E5A93C]/40 backdrop-blur-xl active:scale-95 shadow-md',
    ghost:
      'bg-transparent hover:bg-white/10 text-slate-300 hover:text-white active:scale-95',
    danger:
      'bg-rose-600/90 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30 active:scale-95'
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 220, damping: 15, mass: 0.2 }}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${
        disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
      } ${className}`}
      {...props}
    >
      {/* Subtle shine sweep on hover */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

      {Icon && <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};
