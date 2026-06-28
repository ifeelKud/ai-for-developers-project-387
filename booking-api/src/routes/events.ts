import type { FastifyInstance } from 'fastify';
import { store } from '../store.js';
import { errors, AppError } from '../lib/errors.js';
import { generateSlots } from '../lib/slots.js';

export async function eventsRoutes(fastify: FastifyInstance) {
  fastify.get('/api/events', async () => {
    return store.listEventTypes(false);
  });

  fastify.get<{ Params: { id: string } }>('/api/events/:id', async (req, reply) => {
    const { id } = req.params;
    const eventType = store.getEventType(id);

    if (!eventType || !eventType.isActive) {
      return reply.status(404).send(errors.notFound('EventType', id).toJSON());
    }

    return eventType;
  });

  fastify.get<{ Params: { id: string }; Querystring: { from: string; to: string } }>(
    '/api/events/:id/slots',
    async (req, reply) => {
      const { id } = req.params;
      const { from, to } = req.query;

      if (!from || !to) {
        return reply.status(400).send(
          errors.validation('Missing required query parameters: from, to').toJSON()
        );
      }

      const eventType = store.getEventType(id);
      if (!eventType || !eventType.isActive) {
        return reply.status(404).send(errors.notFound('EventType', id).toJSON());
      }

      try {
        const slots = generateSlots(id, from, to, eventType.durationMinutes);
        return slots;
      } catch (err) {
        if (err instanceof AppError) {
          return reply.status(err.statusCode).send(err.toJSON());
        }
        throw err;
      }
    }
  );
}