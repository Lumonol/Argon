import { Hono } from 'hono';

const app = new Hono();

app.get('/stats', (c) => {
  return c.json({
    openTickets: 12,
    resolvedTickets: 430,
    articles: 25
  });
});

export default app;
