import { v4 as uuidv4 } from 'uuid';

export type BookingStatus = 'confirmed' | 'cancelled';

export interface EventType {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  eventTypeId: string;
  slotStartTime: string;
  slotEndTime: string;
  guestName: string;
  guestEmail: string;
  status: BookingStatus;
  createdAt: string;
  cancelledAt: string | null;
  cancelReason: string | null;
}

class Store {
  private eventTypes: Map<string, EventType> = new Map();
  private bookings: Map<string, Booking> = new Map();

  createEventType(data: Omit<EventType, 'id' | 'createdAt' | 'updatedAt'>): EventType {
    const now = new Date().toISOString();
    const eventType: EventType = {
      ...data,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    this.eventTypes.set(eventType.id, eventType);
    return eventType;
  }

  getEventType(id: string): EventType | undefined {
    return this.eventTypes.get(id);
  }

  listEventTypes(includeInactive = false): EventType[] {
    const all = Array.from(this.eventTypes.values());
    return includeInactive ? all : all.filter(e => e.isActive);
  }

  updateEventType(id: string, data: Omit<EventType, 'id' | 'createdAt' | 'updatedAt'>): EventType | undefined {
    const existing = this.eventTypes.get(id);
    if (!existing) return undefined;
    const updated: EventType = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.eventTypes.set(id, updated);
    return updated;
  }

  deleteEventType(id: string): boolean {
    return this.eventTypes.delete(id);
  }

  createBooking(data: Omit<Booking, 'id' | 'status' | 'createdAt' | 'cancelledAt' | 'cancelReason'>): Booking {
    const booking: Booking = {
      ...data,
      id: uuidv4(),
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      cancelledAt: null,
      cancelReason: null,
    };
    this.bookings.set(booking.id, booking);
    return booking;
  }

  getBooking(id: string): Booking | undefined {
    return this.bookings.get(id);
  }

  listUpcomingBookings(): Booking[] {
    const now = new Date().toISOString();
    return Array.from(this.bookings.values())
      .filter(b => b.status === 'confirmed' && b.slotStartTime > now)
      .sort((a, b) => a.slotStartTime.localeCompare(b.slotStartTime));
  }

  cancelBooking(id: string, reason: string | null): Booking | undefined {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    const updated: Booking = {
      ...booking,
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      cancelReason: reason,
    };
    this.bookings.set(id, updated);
    return updated;
  }

  getAllBookings(): Booking[] {
    return Array.from(this.bookings.values());
  }
}

export const store = new Store();