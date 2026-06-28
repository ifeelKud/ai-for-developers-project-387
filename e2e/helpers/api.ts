const API_BASE = 'http://localhost:3000'

export interface EventType {
  id: string
  name: string
  description: string | null
  durationMinutes: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Slot {
  startTime: string
  endTime: string
  isAvailable: boolean
}

export interface Booking {
  id: string
  eventTypeId: string
  slotStartTime: string
  slotEndTime: string
  guestName: string
  guestEmail: string
  status: 'confirmed' | 'cancelled'
  createdAt: string
  cancelledAt: string | null
  cancelReason: string | null
}

interface ErrorResponse {
  code: string
  message: string
  details: string | null
}

class TestApi {
  async createEventType(
    name: string,
    description: string | null,
    durationMinutes: number
  ): Promise<EventType> {
    const res = await fetch(`${API_BASE}/api/admin/event-types`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, durationMinutes }),
    })
    if (!res.ok) {
      const error: ErrorResponse = await res.json()
      throw new Error(`Failed to create event type: ${error.message}`)
    }
    return res.json()
  }

  async getSlots(eventTypeId: string, from: string, to: string): Promise<Slot[]> {
    const res = await fetch(
      `${API_BASE}/api/events/${eventTypeId}/slots?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    )
    if (!res.ok) {
      const error: ErrorResponse = await res.json()
      throw new Error(`Failed to get slots: ${error.message}`)
    }
    return res.json()
  }

  async createBooking(
    eventTypeId: string,
    slotStartTime: string,
    guestName: string,
    guestEmail: string
  ): Promise<{ status: number; data: Booking | ErrorResponse }> {
    const res = await fetch(`${API_BASE}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventTypeId, slotStartTime, guestName, guestEmail }),
    })
    const data = await res.json()
    return { status: res.status, data }
  }

  async getBooking(id: string): Promise<Booking> {
    const res = await fetch(`${API_BASE}/api/bookings/${id}`)
    if (!res.ok) {
      const error: ErrorResponse = await res.json()
      throw new Error(`Failed to get booking: ${error.message}`)
    }
    return res.json()
  }

  async cancelBooking(
    id: string,
    reason?: string
  ): Promise<{ status: number; data: Booking | ErrorResponse }> {
    const res = await fetch(`${API_BASE}/api/bookings/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancelReason: reason ?? null }),
    })
    const data = await res.json()
    return { status: res.status, data }
  }

  async getEventType(id: string): Promise<EventType | ErrorResponse> {
    const res = await fetch(`${API_BASE}/api/events/${id}`)
    if (!res.ok) {
      return res.json()
    }
    return res.json()
  }

  async listEventTypes(): Promise<EventType[]> {
    const res = await fetch(`${API_BASE}/api/events`)
    return res.json()
  }
}

export const api = new TestApi()