import { createMiddleware } from 'hono/factory';
import { jwt } from 'hono/jwt';
import { env } from '../config/env';
import { db } from '../db/db';
import { apiKeys } from '../db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// Export an auth middleware that checks either JWT or API Key
export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader) {
    return c.json({ error: 'Missing Authorization header' }, 401);
  }

  const token = authHeader.replace(/^Bearer\s/i, '');

  // 1. Try checking if it's an API Key (e.g. starts with "ak_")
  if (token.startsWith('ak_')) {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const rows = await db.select().from(apiKeys).where(eq(apiKeys.keyHash, hash));
    if (rows.length === 0) {
      return c.json({ error: 'Invalid API Key' }, 401);
    }
    c.set('user', { id: rows[0].userId, type: 'api_key' });
    return next();
  }

  // 2. Otherwise try JWT validation
  const jwtMiddleware = jwt({ secret: env.JWT_SECRET || 'fallback_secret' });
  return jwtMiddleware(c, next);
});
