import { store, type Booking } from '../store.js';
import { errors } from './errors.js';

export interface Slot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

const MS_PER_MINUTE = 60 * 1000;
const HOURS_START = 9;
const HOURS_END = 17;
const SLOT_INTERVAL_MINUTES = 30;

export function isSlotWithinWindow(slotStart: Date, slotEnd: Date): boolean {
  const now = new Date();
  const maxDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  return slotStart >= now && slotStart < maxDate && slotEnd <= maxDate;
}

function hasConflict(slotStart: string, slotEnd: string, bookings: Booking[]): boolean {
  const slotStartTime = new Date(slotStart).getTime();
  const slotEndTime = new Date(slotEnd).getTime();

  return bookings.some(booking => {
    if (booking.status !== 'confirmed') return false;
    const bookingStart = new Date(booking.slotStartTime).getTime();
    const bookingEnd = new Date(booking.slotEndTime).getTime();
    return bookingStart < slotEndTime && bookingEnd > slotStartTime;
  });
}

export function generateSlots(
  eventTypeId: string,
  from: string,
  to: string,
  durationMinutes: number
): Slot[] {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const now = new Date();
  const maxDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  if (fromDate < now || toDate > maxDate) {
    throw errors.slotOutsideWindow('Requested time range exceeds 14-day window');
  }

  if (fromDate >= toDate) {
    throw errors.validation('Invalid time range: "from" must be before "to"');
  }

  const allBookings = store.getAllBookings().filter(b => b.eventTypeId === eventTypeId);
  const slots: Slot[] = [];

  const current = new Date(fromDate);
  current.setSeconds(0, 0);

  while (current < toDate) {
    const hour = current.getHours();
    const minute = current.getMinutes();

    if (hour >= HOURS_START && hour < HOURS_END) {
      const slotStart = new Date(current);
      const slotEnd = new Date(slotStart.getTime() + durationMinutes * MS_PER_MINUTE);

      if (slotEnd.getHours() <= HOURS_END || (slotEnd.getHours() === HOURS_END && slotEnd.getMinutes() === 0)) {
        if (isSlotWithinWindow(slotStart, slotEnd)) {
          slots.push({
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            isAvailable: !hasConflict(slotStart.toISOString(), slotEnd.toISOString(), allBookings),
          });
        }
      }
    }

    current.setTime(current.getTime() + SLOT_INTERVAL_MINUTES * MS_PER_MINUTE);
  }

  return slots;
}

export function checkSlotConflict(
  eventTypeId: string,
  slotStartTime: string,
  slotEndTime: string
): boolean {
  const allBookings = store.getAllBookings();
  return hasConflict(slotStartTime, slotEndTime, allBookings);
}

export function validateSlotTime(slotStart: string, durationMinutes: number): { start: Date; end: Date } {
  const start = new Date(slotStart);
  if (isNaN(start.getTime())) {
    throw errors.invalidDate('Invalid slot start time format');
  }

  if (start < new Date()) {
    throw errors.validation('Cannot book a slot in the past');
  }

  const end = new Date(start.getTime() + durationMinutes * MS_PER_MINUTE);
  const maxDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  if (end > maxDate) {
    throw errors.slotOutsideWindow('Booking window exceeds 14 days');
  }

  return { start, end };
}