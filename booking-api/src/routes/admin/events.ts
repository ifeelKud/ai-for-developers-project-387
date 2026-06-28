import type { FastifyInstance } from 'fastify';
import { store } from '../../store.js';
import { errors, AppError } from '../../lib/errors.js';

interface CreateEventTypeBody {
  name: string;
  description: string | null;
  durationMinutes: number;
}

interface UpdateEventTypeBody {
  name: string;
  description: string | null;
  durationMinutes: number;
  isActive: boolean;
}

function validateName(name: string): void {
  if (!name || name.trim().length === 0) {
    throw errors.validation('name is required and must not be empty');
  }
  if (name.length > 200) {
    throw errors.validation('name must not exceed 200 characters');
  }
}

function validateDescription(description: string | null): void {
  if (description !== null && description.length > 2000) {
    throw errors.validation('description must not exceed 2000 characters');
  }
}

function validateDuration(duration: number): void {
  if (!Number.isInteger(duration) || duration < 1) {
    throw errors.validation('durationMinutes must be a positive integer');
  }
}

export async function adminEventsRoutes(fastify: FastifyInstance) {
  fastify.get('/api/admin/event-types', async () => {
    return store.listEventTypes(true);
  });

  fastify.post<{ Body: CreateEventTypeBody }>('/api/admin/event-types', async (req, reply) => {
    const { name, description, durationMinutes } = req.body;

    try {
      if (name !== undefined) validateName(name);
      else throw errors.validation('name is required');

      if (description !== undefined) validateDescription(description);

      if (durationMinutes !== undefined) validateDuration(durationMinutes);
      else throw errors.validation('durationMinutes is required');
    } catch (err) {
      if (err instanceof AppError) {
        return reply.status(err.statusCode).send(err.toJSON());
      }
      throw err;
    }

    const eventType = store.createEventType({
      name: name.trim(),
      description: description?.trim() ?? null,
      durationMinutes,
      isActive: true,
    });

    return reply.status(201).send(eventType);
  });

  fastify.put<{ Params: { id: string }; Body: UpdateEventTypeBody }>(
    '/api/admin/event-types/:id',
    async (req, reply) => {
      const { id } = req.params;
      const { name, description, durationMinutes, isActive } = req.body;

      const existing = store.getEventType(id);
      if (!existing) {
        return reply.status(404).send(errors.notFound('EventType', id).toJSON());
      }

      try {
        if (name !== undefined) validateName(name);
        if (description !== undefined) validateDescription(description);
        if (durationMinutes !== undefined) validateDuration(durationMinutes);
      } catch (err) {
        if (err instanceof AppError) {
          return reply.status(err.statusCode).send(err.toJSON());
        }
        throw err;
      }

      const updated = store.updateEventType(id, {
        name: name.trim(),
        description: description?.trim() ?? null,
        durationMinutes,
        isActive,
      });

      return updated!;
    }
  );

  fastify.delete<{ Params: { id: string } }>('/api/admin/event-types/:id', async (req, reply) => {
    const { id } = req.params;

    const existing = store.getEventType(id);
    if (!existing) {
      return reply.status(404).send(errors.notFound('EventType', id).toJSON());
    }

    store.deleteEventType(id);
    return reply.status(204).send();
  });
}