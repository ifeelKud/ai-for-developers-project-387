import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success'
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-primary text-primary-foreground': variant === 'default',
          'bg-secondary text-secondary-foreground': variant === 'secondary',
          'bg-destructive text-destructive-foreground': variant === 'destructive',
          'border border-input': variant === 'outline',
          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300': variant === 'success',
        },
        className
      )}
      {...props}
    />
  )
}