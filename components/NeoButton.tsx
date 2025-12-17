
import React from 'react';

interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

const NeoButton: React.FC<NeoButtonProps> = ({ variant = 'primary', children, className = '', ...props }) => {
  const baseStyles = "px-6 py-2 border-[1px] border-black font-bold transition-all neo-shadow neo-button uppercase tracking-wider text-sm md:text-base";
  const variantStyles = variant === 'primary' ? "bg-[#90EE90]" : "bg-white";
  
  return (
    <button 
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default NeoButton;
