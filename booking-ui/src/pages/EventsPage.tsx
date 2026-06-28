import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { publicEvents } from '@/api/client'
import type { EventType } from '@/api/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDuration } from '@/lib/date'

function EventCard({ event }: { event: EventType }) {
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader>
        <CardTitle className="text-lg">{event.name}</CardTitle>
        <CardDescription>{formatDuration(event.durationMinutes)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {event.description || 'No description available'}
        </p>
            <Link to={`/events/${event.id}`}>
              <Button className="w-full">Book</Button>
            </Link>
      </CardContent>
    </Card>
  )
}

export function EventsPage() {
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await publicEvents.list()
      return res.data as EventType[]
    },
    staleTime: 0,
  })

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading events...</div>
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        Failed to load events. Make sure the API server is running.
      </div>
    )
  }

  if (!events?.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No events available at the moment.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Available Events</h1>
        <p className="text-muted-foreground mt-2">Browse and book your preferred event</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event: EventType) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  )
}