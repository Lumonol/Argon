import { Hono } from 'hono';
import { db } from '../db/db';
import { configState } from '../db/schema';
import { eq } from 'drizzle-orm';
import { env } from '../config/env';

export const configRouter = new Hono();

configRouter.get('/setup-status', async (c) => {
  if (env.ARGON_EDITION === 'datacenter') {
    return c.json({ configured: true, edition: 'datacenter' });
  }

  const dbRows = await db.select().from(configState).where(eq(configState.key, 'database'));
  const authRows = await db.select().from(configState).where(eq(configState.key, 'auth'));
  
  const isConfigured = dbRows.length > 0 && authRows.length > 0;
  return c.json({ configured: isConfigured, edition: 'community' });
});

configRouter.get('/:key', async (c) => {
  const { key } = c.req.param();

  if (env.ARGON_EDITION === 'datacenter') {
    if (key === 'database') {
      return c.json({ key, value: { url: env.DATABASE_URL } });
    }
    if (key === 'auth') {
      return c.json({ key, value: { provider: env.AUTH_PROVIDER || 'none', key: env.AUTH_SECRET_KEY || '' } });
    }
  }

  const rows = await db.select().from(configState).where(eq(configState.key, key));
  
  if (rows.length === 0) return c.json({ error: 'Config not found' }, 404);
  return c.json({ key, value: JSON.parse(rows[0].value) });
});

configRouter.post('/', async (c) => {
  if (env.ARGON_EDITION === 'datacenter') {
    return c.json({ error: 'Configuration cannot be modified in datacenter mode' }, 403);
  }

  const { key, value } = await c.req.json();

  const existing = await db.select().from(configState).where(eq(configState.key, key));
  if (existing.length > 0) {
    await db.update(configState).set({ value: JSON.stringify(value), updatedAt: new Date() }).where(eq(configState.key, key));
  } else {
    await db.insert(configState).values({ key, value: JSON.stringify(value), updatedAt: new Date() });
  }

  return c.json({ message: 'Config updated' });
});

