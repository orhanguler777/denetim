import React from 'react';
import { cn } from './Button';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && <label className="text-sm font-medium text-gray-700 ml-1">{label}</label>}
        <input
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus-visible:border-red-500",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-500 ml-1 font-medium">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
