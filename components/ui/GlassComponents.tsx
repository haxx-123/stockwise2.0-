import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export const GlassCard: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
  return (
    <div className={cn('glass rounded-2xl p-6 transition-all duration-300', className)} {...props}>
      {children}
    </div>
  );
};

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger', isLoading?: boolean }> = ({ 
  className, 
  variant = 'primary', 
  isLoading, 
  children, 
  ...props 
}) => {
  const baseStyles = "relative overflow-hidden rounded-xl px-4 py-2 font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-[var(--color-accent)] text-white shadow-lg hover:brightness-110",
    ghost: "bg-transparent border border-[var(--color-text-primary)]/20 hover:bg-[var(--color-text-primary)]/5",
    danger: "bg-red-500/80 text-white hover:bg-red-600/80"
  };

  return (
    <button className={cn(baseStyles, variants[variant], className)} disabled={isLoading || props.disabled} {...props}>
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => {
  return (
    <input 
      className={cn(
        "glass w-full rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-accent)] bg-white/20 placeholder-[var(--color-text-primary)]/50",
        className
      )} 
      {...props} 
    />
  );
};

export const Badge: React.FC<{ role: string }> = ({ role }) => {
  // 00 level gets special neon gradient
  if (role === '00') {
    return (
      <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8A2BE2] via-[#FF1493] to-[#00FFFF] drop-shadow-sm">
        SVIP Architect
      </span>
    );
  }
  if (role === '01') {
    return (
      <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFFFE0] drop-shadow-sm">
        Boss
      </span>
    );
  }
  return (
    <span className="px-2 py-1 rounded-md bg-[var(--color-text-primary)]/10 text-xs font-mono">
      Lvl.{role}
    </span>
  );
};
