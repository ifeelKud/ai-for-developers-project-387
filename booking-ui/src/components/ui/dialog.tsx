import { type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { Button } from './button'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 w-full max-w-lg bg-background rounded-lg shadow-lg p-6 mx-4">
        {children}
      </div>
    </div>,
    document.body
  )
}

interface DialogHeaderProps {
  children: ReactNode
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return <div className="mb-4">{children}</div>
}

interface DialogTitleProps {
  children: ReactNode
}

export function DialogTitle({ children }: DialogTitleProps) {
  return <h2 className="text-xl font-semibold">{children}</h2>
}

interface DialogFooterProps {
  children: ReactNode
}

export function DialogFooter({ children }: DialogFooterProps) {
  return <div className="mt-6 flex justify-end gap-3">{children}</div>
}

interface DialogCloseProps {
  onClose: () => void
}

export function DialogClose({ onClose }: DialogCloseProps) {
  return (
    <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-4 top-4">
      <X className="h-4 w-4" />
    </Button>
  )
}