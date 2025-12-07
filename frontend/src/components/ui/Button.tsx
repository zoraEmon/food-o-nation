import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none disabled:opacity-50",
          // Variants
          variant === 'primary' && "bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200",
          variant === 'outline' && "border-2 border-current bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800",
          variant === 'ghost' && "hover:bg-gray-100 dark:hover:bg-gray-800",
          // Sizes
          size === 'sm' && "h-9 px-3 text-sm",
          size === 'md' && "h-10 px-4 py-2",
          size === 'lg' && "h-11 px-8",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };