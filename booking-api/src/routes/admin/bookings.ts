import type { FastifyInstance } from 'fastify';
import { store } from '../../store.js';
import { errors, AppError } from '../../lib/errors.js';

interface CancelBookingBody {
  cancelReason: string | null;
}

export async function adminBookingsRoutes(fastify: FastifyInstance) {
  fastify.get('/api/admin/bookings', async () => {
    return store.listUpcomingBookings();
  });

  fastify.post<{ Params: { id: string }; Body: CancelBookingBody }>(
    '/api/admin/bookings/:id/cancel',
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