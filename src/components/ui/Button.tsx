import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'lg', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
          {
            'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
            'bg-gray-100 text-gray-900 hover:bg-gray-200': variant === 'secondary',
            'border-2 border-gray-200 bg-transparent hover:border-gray-300 text-gray-900': variant === 'outline',
            'bg-transparent text-blue-600 hover:bg-blue-50': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
            'h-12 px-6 text-base': size === 'md', // min 48px height
            'h-14 px-8 text-lg': size === 'lg', // 56px height for primary actions
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
