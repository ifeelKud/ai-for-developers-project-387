import type { FastifyInstance } from 'fastify';
import { store } from '../store.js';
import { errors, AppError } from '../lib/errors.js';
import { checkSlotConflict, validateSlotTime } from '../lib/slots.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CreateBookingBody {
  eventTypeId: string;
  slotStartTime: string;
  guestName: string;
  guestEmail: string;
}

interface CancelBookingBody {
  cancelReason: string | null;
}

export async function bookingsRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: CreateBookingBody }>('/api/bookings', async (req, reply) => {
    const { eventTypeId, slotStartTime, guestName, guestEmail } = req.body;

    if (!eventTypeId || !slotStartTime || !guestName || !guestEmail) {
      return reply.status(400).send(
        errors.validation('Missing required fields: eventTypeId, slotStartTime, guestName, guestEmail').toJSON()
      );
    }

    if (guestName.trim().length === 0) {
      return reply.status(400).send(
        errors.validation('guestName must not be empty').toJSON()
      );
    }

    if (!EMAIL_REGEX.test(guestEmail)) {
      return reply.status(400).send(errors.invalidEmail().toJSON());
    }

    const eventType = store.getEventType(eventTypeId);
    if (!eventType || !eventType.isActive) {
      return reply.status(404).send(errors.notFound('EventType', eventTypeId).toJSON());
    }

    let parsedSlot: { start: Date; end: Date };
    try {
      parsedSlot = validateSlotTime(slotStartTime, eventType.durationMinutes);
    } catch (err) {
      if (err instanceof AppError) {
        return reply.status(err.statusCode).send(err.toJSON());
      }
      throw err;
    }

    if (checkSlotConflict(eventTypeId, parsedSlot.start.toISOString(), parsedSlot.end.toISOString())) {
      return reply.status(409).send(errors.slotOccupied().toJSON());
    }

    const booking = store.createBooking({
      eventTypeId,
      slotStartTime: parsedSlot.start.toISOString(),
      slotEndTime: parsedSlot.end.toISOString(),
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim(),
    });

    return reply.status(201).send(booking);
  });

  fastify.get<{ Params: { id: string } }>('/api/bookings/:id', async (req, reply) => {
    const { id } = req.params;
    const booking = store.getBooking(id);

    if (!booking) {
      return reply.status(404).send(errors.notFound('Booking', id).toJSON());
    }

    return booking;
  });

  fastify.post<{ Params: { id: string }; Body: CancelBookingBody }>(
    '/api/bookings/:id/cancel',
    async (req, reply) => {
      const { id } = req.params;
      const { cancelReason } = req.body;

      const booking = store.getBooking(id);
      if (!booking) {
        return reply.status(404).send(errors.notFound('Booking', id).toJSON());
      }

      if (booking.status === 'cancelled') {
        return reply.status(400).send(
          errors.validation('Booking is already cancelled').toJSON()
        );
      }

      const updated = store.cancelBooking(id, cancelReason ?? null);
      return updated!;
    }
  );
}