import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminEventTypes, type EventType, type CreateEventTypeRequest, type UpdateEventTypeRequest } from '@/api/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { formatDuration } from '@/lib/date'

function EventTypeForm({
  onSubmit,
  onCancel,
  isLoading,
  initialData,
}: {
  onSubmit: (data: CreateEventTypeRequest | UpdateEventTypeRequest) => void
  onCancel: () => void
  isLoading: boolean
  initialData?: EventType
}) {
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [durationMinutes, setDurationMinutes] = useState(
    initialData?.durationMinutes?.toString() || '30'
  )
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      description: description || null,
      durationMinutes: parseInt(durationMinutes, 10),
      ...(initialData ? { isActive } : {}),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Event type name"
          required
          minLength={1}
          maxLength={200}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description || ''}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Event type description"
          rows={3}
          maxLength={2000}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input
          id="duration"
          type="number"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
          required
          min={1}
        />
      </div>
      {initialData && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
      )}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function AdminEventsPage() {
  const queryClient = useQueryClient()
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const { data: events, isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => {
      const res = await adminEventTypes.list()
      return res.data as EventType[]
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: CreateEventTypeRequest) => {
      const res = await adminEventTypes.create(data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
      setIsCreating(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateEventTypeRequest }) => {
      const res = await adminEventTypes.update(id, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
      setEditingEvent(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminEventTypes.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Event Types</h1>
          <p className="text-muted-foreground mt-2">Manage your event types</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Event Type
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Name</TableHead>
                <TableHead className="text-left">Duration</TableHead>
                <TableHead className="text-left">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events?.map((event: EventType) => (
                <TableRow key={event.id}>
                  <TableCell className="text-left font-medium">{event.name}</TableCell>
                  <TableCell className="text-left">{formatDuration(event.durationMinutes)}</TableCell>
                  <TableCell className="text-left">
                    <Badge variant={event.isActive ? 'success' : 'secondary'}>
                      {event.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingEvent(event)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this event type?')) {
                            deleteMutation.mutate(event.id)
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogHeader>
          <DialogTitle>Create Event Type</DialogTitle>
        </DialogHeader>
        <DialogClose onClose={() => setIsCreating(false)} />
        <EventTypeForm
          onSubmit={(data) => createMutation.mutate(data as CreateEventTypeRequest)}
          onCancel={() => setIsCreating(false)}
          isLoading={createMutation.isPending}
        />
      </Dialog>

      <Dialog open={!!editingEvent} onOpenChange={() => setEditingEvent(null)}>
        <DialogHeader>
          <DialogTitle>Edit Event Type</DialogTitle>
        </DialogHeader>
        <DialogClose onClose={() => setEditingEvent(null)} />
        {editingEvent && (
          <EventTypeForm
            initialData={editingEvent}
            onSubmit={(data) =>
              updateMutation.mutate({ id: editingEvent.id, data: data as UpdateEventTypeRequest })
            }
            onCancel={() => setEditingEvent(null)}
            isLoading={updateMutation.isPending}
          />
        )}
      </Dialog>
    </div>
  )
}