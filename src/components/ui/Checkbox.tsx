import React from 'react';
import { cn } from './Button';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-gray-100 bg-white cursor-pointer hover:bg-gray-50 transition-colors active:bg-gray-100", className)}>
        <input
          type="checkbox"
          ref={ref}
          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0 cursor-pointer"
          {...props}
        />
        <span className="text-gray-900 font-medium text-sm select-none">{label}</span>
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";
