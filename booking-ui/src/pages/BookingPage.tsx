import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { publicBookings, type Booking } from '@/api/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatDateTime } from '@/lib/date'

function BookingStatusBadge({ status }: { status: string }) {
  const isConfirmed = status === 'confirmed'
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isConfirmed
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export function BookingPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [cancelReason, setCancelReason] = useState('')

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      const res = await publicBookings.get(id!)
      const data = res.data
      if (data && 'code' in data) {
        throw new Error(data.message)
      }
      return data as Booking
    },
    enabled: !!id,
  })

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const res = await publicBookings.cancel(id!, { cancelReason: cancelReason || null })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] })
      setCancelReason('')
    },
  })

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading booking...</div>
  }

  if (!booking) {
    return <div className="text-center py-12 text-destructive">Booking not found</div>
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Booking Confirmation</h1>
        <p className="text-muted-foreground mt-2">Your booking details</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Booking #{booking.id.slice(0, 8)}</CardTitle>
            <BookingStatusBadge status={booking.status} />
          </div>
          <CardDescription>
            Created {formatDateTime(booking.createdAt)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Event ID</Label>
              <p className="font-medium">{booking.eventTypeId}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Duration</Label>
              <p className="font-medium">
                {formatDateTime(booking.slotStartTime)} - {formatDateTime(booking.slotEndTime)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Guest Name</Label>
              <p className="font-medium">{booking.guestName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Guest Email</Label>
              <p className="font-medium">{booking.guestEmail}</p>
            </div>
          </div>
          {booking.cancelReason && (
            <div>
              <Label className="text-muted-foreground">Cancellation Reason</Label>
              <p className="font-medium">{booking.cancelReason}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {booking.status === 'confirmed' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cancel Booking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cancelReason">Reason for cancellation (optional)</Label>
              <Textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason..."
                rows={3}
              />
            </div>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Booking'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}