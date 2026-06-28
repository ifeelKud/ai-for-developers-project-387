import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminBookings, type Booking, type CancelBookingRequest } from '@/api/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { XCircle } from 'lucide-react'
import { formatDateTime } from '@/lib/date'

function CancelBookingDialog({
  onClose,
  onConfirm,
  isLoading,
}: {
  onClose: () => void
  onConfirm: (reason: string | null) => void
  isLoading: boolean
}) {
  const [reason, setReason] = useState('')

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Are you sure you want to cancel this booking? This action cannot be undone.
      </p>
      <div className="space-y-2">
        <Label htmlFor="cancelReason">Reason (optional)</Label>
        <Textarea
          id="cancelReason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for cancellation..."
          rows={3}
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Keep Booking
        </Button>
        <Button variant="destructive" onClick={() => onConfirm(reason || null)} disabled={isLoading}>
          {isLoading ? 'Cancelling...' : 'Cancel Booking'}
        </Button>
      </DialogFooter>
    </div>
  )
}

export function AdminBookingsPage() {
  const queryClient = useQueryClient()
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'cancelled'>('all')

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const res = await adminBookings.list()
      return res.data as Booking[]
    },
  })

  const cancelMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string | null }) => {
      const res = await adminBookings.cancel(id, { cancelReason: reason } as CancelBookingRequest)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] })
      setCancellingBooking(null)
    },
  })

  const filteredBookings = bookings?.filter((booking: Booking) => {
    if (statusFilter === 'all') return true
    return booking.status === statusFilter
  })

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bookings</h1>
        <p className="text-muted-foreground mt-2">View and manage all bookings</p>
      </div>

      <div className="flex gap-2">
        {(['all', 'confirmed', 'cancelled'] as const).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            onClick={() => setStatusFilter(status)}
            size="sm"
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">ID</TableHead>
                <TableHead className="text-left">Guest</TableHead>
                <TableHead className="text-left">Event</TableHead>
                <TableHead className="text-left">Time</TableHead>
                <TableHead className="text-left">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings?.map((booking: Booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="text-left font-mono text-xs">
                    {booking.id.slice(0, 8)}
                  </TableCell>
                  <TableCell className="text-left">
                    <div>
                      <p className="font-medium">{booking.guestName}</p>
                      <p className="text-xs text-muted-foreground">{booking.guestEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-left">{booking.eventTypeId}</TableCell>
                  <TableCell className="text-left">{formatDateTime(booking.slotStartTime)}</TableCell>
                  <TableCell className="text-left">
                    <Badge variant={booking.status === 'confirmed' ? 'success' : 'destructive'}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {booking.status === 'confirmed' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCancellingBooking(booking)}
                      >
                        <XCircle className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!cancellingBooking} onOpenChange={() => setCancellingBooking(null)}>
        <DialogHeader>
          <DialogTitle>Cancel Booking</DialogTitle>
        </DialogHeader>
        <DialogClose onClose={() => setCancellingBooking(null)} />
        {cancellingBooking && (
          <CancelBookingDialog
            onClose={() => setCancellingBooking(null)}
            onConfirm={(reason) =>
              cancelMutation.mutate({ id: cancellingBooking.id, reason })
            }
            isLoading={cancelMutation.isPending}
          />
        )}
      </Dialog>
    </div>
  )
}