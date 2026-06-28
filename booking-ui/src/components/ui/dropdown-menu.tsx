import { type ReactNode, useState, useRef, useEffect } from 'react'

type DropdownMenuRenderProps = (open: boolean, setOpen: (open: boolean) => void) => ReactNode

interface DropdownMenuProps {
  children: DropdownMenuRenderProps
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative inline-block">
      {children(open, setOpen)}
    </div>
  )
}

export function DropdownMenuTrigger({ children }: { children: DropdownMenuRenderProps }) {
  return children
}

interface ContentProps {
  align?: 'start' | 'end'
  children: ReactNode
}

export function DropdownMenuContent({ align = 'start', children }: ContentProps) {
  return (
    <div
      className={`
        absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-background p-1 shadow-md
        ${align === 'end' ? 'right-0' : 'left-0'}
      `}
    >
      {children}
    </div>
  )
}

interface ItemProps {
  children: ReactNode
  onSelect?: () => void
}

export function DropdownMenuItem({ children, onSelect }: ItemProps) {
  return (
    <div
      className="cursor-pointer rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent"
      onClick={onSelect}
    >
      {children}
    </div>
  )
}

export function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-border" />
}