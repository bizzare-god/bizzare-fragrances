import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-luxury-gold disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-brown text-white font-bold tracking-wider hover:bg-brown-hover shadow-sm',
        gold:
          'bg-brown-warm text-black font-bold tracking-wider hover:bg-cream-light hover:text-black shadow-sm',
        emerald:
          'bg-emerald-700 text-white font-bold tracking-wider hover:bg-emerald-800 shadow-sm',
        outline:
          'border border-cream-border bg-white text-brown-deep font-bold hover:border-brown hover:bg-cream-soft',
        ghost:
          'text-brown-deep hover:bg-cream-soft hover:text-brown',
        secondary:
          'border border-white/15 bg-white/10 text-white font-semibold hover:bg-white/20',
        danger:
          'bg-red-700 text-white font-bold tracking-wider hover:bg-red-800 shadow-sm',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base tracking-wide',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
