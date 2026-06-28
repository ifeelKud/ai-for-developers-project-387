import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <table ref={ref} className={cn('w-full text-sm text-left', className)} {...props} />
  )
)
Table.displayName = 'Table'

const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn('border-b bg-muted/50', className)} {...props} />
  )
)
TableHeader.displayName = 'TableHeader'

const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('divide-y', className)} {...props} />
  )
)
TableBody.displayName = 'TableBody'

const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={cn('hover:bg-muted/50 transition-colors', className)} {...props} />
  )
)
TableRow.displayName = 'TableRow'

const TableHead = forwardRef<HTMLTableCellElement, HTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th ref={ref} className={cn('h-12 px-4 text-right font-medium text-muted-foreground', className)} {...props} />
  )
)
TableHead.displayName = 'TableHead'

const TableCell = forwardRef<HTMLTableCellElement, HTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={cn('px-4 py-3 text-right', className)} {...props} />
  )
)
TableCell.displayName = 'TableCell'

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }