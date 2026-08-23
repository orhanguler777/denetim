import React from 'react';
import { cn } from './Button';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && <label className="text-sm font-medium text-gray-700 ml-1">{label}</label>}
        <textarea
          ref={ref}
          className={cn(
            "flex min-h-[80px] w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 resize-y",
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
Textarea.displayName = "Textarea";
