import React from 'react';

interface BaseProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

// Structural Card: Solid, sharp edges, subtle border
export const Card: React.FC<BaseProps> = ({ children, className = '', onClick, style }) => {
  return (
    <div 
      onClick={onClick}
      style={style}
      className={`
        bg-surface border border-border
        hover:border-white/40 transition-colors duration-500
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// Primary Button: High contrast, uppercase, industrial
export const Button: React.FC<BaseProps & { variant?: 'primary' | 'secondary' | 'outline', disabled?: boolean, type?: 'button' | 'submit' | 'reset' }> = ({ 
  children, className = '', onClick, variant = 'primary', disabled, type = 'button' 
}) => {
  const baseStyles = "px-8 py-4 font-bold uppercase tracking-wider text-xs transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";
  
  const variants = {
    primary: "bg-white text-black hover:bg-gray-200 border border-transparent",
    secondary: "bg-surfaceHighlight text-white hover:bg-border border border-transparent",
    outline: "bg-transparent border border-white/30 text-white hover:border-white hover:bg-white/5"
  };

  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// Technical Input: Mono-spaced placeholder, bottom border only or solid block
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
  return (
    <input 
      {...props}
      className={`
        w-full bg-surface border-b border-border px-0 py-4 text-white placeholder-secondary
        focus:outline-none focus:border-white transition-colors duration-300
        font-mono text-sm
        ${props.className}
      `}
    />
  );
};

// Select
export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => {
  return (
    <select 
      {...props}
      className={`
        w-full bg-surface border-b border-border px-0 py-4 text-white cursor-pointer
        focus:outline-none focus:border-white transition-colors duration-300
        font-mono text-sm appearance-none
        ${props.className}
      `}
    >
      {props.children}
    </select>
  );
};

// Section Header
export const SectionHeader: React.FC<{ title: string, subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-12 border-t border-white/20 pt-6 flex flex-col md:flex-row justify-between items-start md:items-end">
    <h2 className="text-4xl md:text-6xl font-light tracking-tighter uppercase">{title}</h2>
    {subtitle && <p className="text-secondary font-mono text-xs md:text-sm mt-2 md:mt-0 max-w-xs text-right">{subtitle}</p>}
  </div>
);

// Badge
export const Badge: React.FC<{ children: React.ReactNode, active?: boolean }> = ({ children, active }) => (
  <span className={`
    px-3 py-1 text-[10px] font-mono uppercase tracking-widest border
    ${active ? 'bg-white text-black border-white' : 'bg-transparent text-secondary border-secondary'}
  `}>
    {children}
  </span>
);