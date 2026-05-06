import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'outline';
}

export const Button = ({ children, variant = 'primary', className = '', ...props }: ButtonProps) => {
  const baseStyle = "w-full md:w-auto px-4 py-2 rounded font-medium transition active:scale-95";
  const variants = {
    primary: "bg-blue-900 text-white hover:bg-blue-800",
    danger: "bg-red-800 text-white hover:bg-red-700",
    outline: "border border-blue-900 text-blue-900 hover:bg-blue-50"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
