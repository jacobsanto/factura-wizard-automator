
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const DashboardButton: React.FC<ButtonProps> = ({ 
  children,
  className,
  ...props
}) => {
  return (
    <button 
      className={`px-4 py-2 rounded font-medium text-white ${className} ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`} 
      {...props}
    >
      {children}
    </button>
  );
};

export default DashboardButton;
