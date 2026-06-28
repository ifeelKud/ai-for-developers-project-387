import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import { eventsRoutes } from './routes/events.js';
import { bookingsRoutes } from './routes/bookings.js';
import { adminEventsRoutes } from './routes/admin/events.js';
import { adminBookingsRoutes } from './routes/admin/bookings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
  logger: true,
});

const isProduction = process.env.NODE_ENV === 'production';

await fastify.register(cors, {
  origin: isProduction ? true : ['http://localhost:5173', 'http://localhost:4173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
});

const staticDir = process.env.STATIC_DIR || path.join(__dirname, '../../booking-ui/dist');

await fastify.register(fastifyStatic, {
  root: staticDir,
  prefix: '/',
});

await fastify.register(eventsRoutes);
await fastify.register(bookingsRoutes);
await fastify.register(adminEventsRoutes);
await fastify.register(adminBookingsRoutes);

fastify.setNotFoundHandler((request, reply) => {
  if (request.url.startsWith('/api/')) {
    reply.code(404).send({ error: 'NOT_FOUND', message: 'Route not found' });
    return;
  }
  reply.type('text/html').sendFile('index.html');
});

const start = async () => {
  const PORT = Number(process.env.PORT) || 3000;
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Server running on port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
