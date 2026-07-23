import { Hono } from 'hono';
import { db } from '../db/db';
import { edgeFunctions, configState } from '../db/schema';
import { eq } from 'drizzle-orm';
import { EdgeSandbox } from '../services/sandbox';

export const functionsRouter = new Hono();

functionsRouter.post('/', async (c) => {
  const body = await c.req.json();
  const { id, name, code, userId } = body;

  await db.insert(edgeFunctions).values({
    id,
    name,
    code,
    userId,
    createdAt: new Date(),
  });

  return c.json({ message: 'Function created', id });
});

functionsRouter.post('/:id/execute', async (c) => {
  const { id } = c.req.param();
  const payload = await c.req.json().catch(() => ({}));

  const rows = await db.select().from(edgeFunctions).where(eq(edgeFunctions.id, id));
  if (rows.length === 0) return c.json({ error: 'Function not found' }, 404);

  const func = rows[0];

  try {
    const result = await EdgeSandbox.execute(func.code, { requestPayload: payload });
    return c.json({ result });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});
