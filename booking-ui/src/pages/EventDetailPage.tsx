import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { publicEvents, publicBookings, type Slot, type EventType, type Booking } from '@/api/client'
import type { CreateBookingRequest } from '@/api/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatDuration, formatDateTime, getMinDateString, getMaxDateString } from '@/lib/date'

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  })
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [error, setError] = useState<string>('')

  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const res = await publicEvents.get(id!)
      if (res.data && 'code' in res.data) {
        throw new Error(res.data.message)
      }
      return res.data as EventType
    },
    enabled: !!id,
  })

  const fromDate = new Date(selectedDate)
  fromDate.setHours(0, 0, 0, 0)
  const toDate = new Date(selectedDate)
  toDate.setHours(23, 59, 59, 999)

  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ['slots', id, selectedDate],
    queryFn: async () => {
      const res = await publicEvents.getSlots(id!, fromDate.toISOString(), toDate.toISOString())
      if (Array.isArray(res.data)) {
        return res.data as Slot[]
      }
      return []
    },
    enabled: !!id && !!selectedDate,
  })

  const createBookingMutation = useMutation({
    mutationFn: async (data: CreateBookingRequest) => {
      const res = await publicBookings.create(data)
      if (res.error && 'code' in res.error) {
        throw new Error(res.error.message)
      }
      if (res.data && 'id' in res.data) {
        return res.data
      }
      throw new Error('Unexpected response')
    },
    onSuccess: (data) => {
      if (data && 'id' in data) {
        queryClient.invalidateQueries({ queryKey: ['bookings'] })
        navigate(`/bookings/${(data as Booking).id}`)
      }
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !selectedSlot) return
    setError('')

    createBookingMutation.mutate({
      eventTypeId: id,
      slotStartTime: selectedSlot.startTime,
      guestName,
      guestEmail,
    })
  }

  if (eventLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading event...</div>
  }

  if (!event) {
    return <div className="text-center py-12 text-destructive">Event not found</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{event.name}</CardTitle>
          <p className="text-muted-foreground">{formatDuration(event.durationMinutes)}</p>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{event.description || 'No description available'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select a Date</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={getMinDateString()}
            max={getMaxDateString()}
          />
        </CardContent>
      </Card>

      {slotsLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading slots...</div>
      ) : slots && slots.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Available Times</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {slots
                .filter((slot: Slot) => slot.isAvailable)
                .map((slot: Slot, idx: number) => (
                  <Button
                    key={idx}
                    variant={selectedSlot === slot ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedSlot(slot)
                      setError('')
                    }}
                    className="justify-start"
                  >
                    {formatDateTime(slot.startTime)}
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No available slots for this date
          </CardContent>
        </Card>
      )}

      {selectedSlot && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Information</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="guestName">Name</Label>
                <Input
                  id="guestName"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guestEmail">Email</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createBookingMutation.isPending}
              >
                {createBookingMutation.isPending ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}