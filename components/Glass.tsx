import React from 'react';

interface GlassProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassProps> = ({ children, className = '', onClick, style }) => {
  return (
    <div 
      onClick={onClick}
      style={style}
      className={`
        relative overflow-hidden rounded-2xl
        bg-white/5 backdrop-blur-xl 
        border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]
        hover:border-white/20 hover:bg-white/10 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
        transition-all duration-300 ease-out
        ${className}
      `}
    >
      {/* Inner highlight for liquid feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export const GlassButton: React.FC<GlassProps & { variant?: 'primary' | 'secondary' | 'danger', disabled?: boolean }> = ({ 
  children, className = '', onClick, variant = 'primary', disabled 
}) => {
  const baseStyles = "relative px-6 py-3 rounded-xl font-medium transition-all duration-300 backdrop-blur-md border shadow-lg flex items-center justify-center overflow-hidden group";
  
  const variants = {
    primary: "bg-primary-600/80 border-primary-400/30 text-white hover:bg-primary-500/90 hover:shadow-primary-500/20",
    secondary: "bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:text-white",
    danger: "bg-red-500/20 border-red-500/30 text-red-200 hover:bg-red-500/40 hover:text-white"
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <span className="relative z-10 flex items-center">{children}</span>
      {/* Shine effect on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out" />
    </button>
  );
};

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const GlassInput: React.FC<GlassInputProps> = (props) => {
  return (
    <input 
      {...props}
      className={`
        w-full bg-slate-900/50 backdrop-blur-md border border-white/10 
        rounded-xl px-4 py-3 text-slate-100 placeholder-slate-400
        focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20
        transition-all duration-300
        ${props.className}
      `}
    />
  );
};

interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: string[];
}

export const GlassSelect: React.FC<GlassSelectProps> = ({ options, className, ...props }) => {
  return (
    <div className="relative">
      <select 
        {...props}
        className={`
          appearance-none w-full bg-slate-900/50 backdrop-blur-md border border-white/10 
          rounded-xl px-4 py-3 text-slate-100 cursor-pointer
          focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20
          transition-all duration-300
          ${className}
        `}
      >
        {props.children}
      </select>
    </div>
  );
};