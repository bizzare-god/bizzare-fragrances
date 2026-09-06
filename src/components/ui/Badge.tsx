import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-brown focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-brown/10 text-brown border border-brown/25',
        emerald: 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold',
        amber: 'bg-amber-50 text-amber-900 border border-amber-300 font-bold',
        red: 'bg-red-50 text-red-800 border border-red-300 font-bold',
        outline: 'border border-cream-border bg-white text-brown-deep font-semibold',
        secondary: 'bg-blue-50 text-blue-900 border border-blue-300 font-bold',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
