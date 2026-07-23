import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { env } from './config/env';

import { functionsRouter } from './routes/functions';
import { configRouter } from './routes/config';
import { modulesRouter } from './routes/modules';

const app = new Hono();

// Example unprotected route
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', message: 'Argon Backend is running!' });
});

// Protect all /api/admin routes or specific function routes
// app.use('/api/functions/*', authMiddleware);

app.route('/api/functions', functionsRouter);
app.route('/api/config', configRouter);
app.route('/api/modules', modulesRouter);

import { loadModuleRoutes } from './moduleLoader';
await loadModuleRoutes(app);

import { serveStatic } from '@hono/node-server/serve-static';

// Serve static assets from the frontend build
app.use('/assets/*', serveStatic({ root: './dist' }));
app.use('/vite.svg', serveStatic({ root: './dist' }));

// Catch-all route to serve the React app
app.get('*', serveStatic({ path: './dist/index.html' }));

const port = parseInt(env.PORT, 10);
console.log(`Starting Argon Backend on port ${port}...`);

serve({
  fetch: app.fetch,
  port
});
