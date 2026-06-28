import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Events' },
]

const adminItems = [
  { href: '/admin/events', label: 'Event Types' },
  { href: '/admin/bookings', label: 'Bookings' },
]

export function Navigation() {
  const location = useLocation()

  const isAdminActive = location.pathname.startsWith('/admin')

  return (
    <header className="border-b bg-card">
      <nav className="container mx-auto flex items-center gap-6 px-4 py-4">
        <Link to="/" className="text-xl font-semibold text-primary">
          Booking Service
        </Link>
        <div className="flex gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                location.pathname === item.href
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
          <DropdownMenu>
            {(open: boolean, setOpen: (open: boolean) => void) => (
              <>
                <button
                  onClick={() => setOpen(!open)}
                  className={cn(
                    'flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary',
                    isAdminActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  Admin
                  <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
                </button>
                {open && (
                  <DropdownMenuContent align="start">
                    {adminItems.map((item) => (
                      <DropdownMenuItem
                        key={item.href}
                        onSelect={() => setOpen(false)}
                      >
                        <Link to={item.href}>{item.label}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                )}
              </>
            )}
          </DropdownMenu>
        </div>
      </nav>
    </header>
  )
}