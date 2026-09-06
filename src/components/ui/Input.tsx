import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-cream-border bg-cream-soft px-3 py-2 text-sm text-brown-deep placeholder:text-brown-deep/40 focus:border-brown focus:bg-white focus:outline-none focus:ring-1 focus:ring-brown disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
