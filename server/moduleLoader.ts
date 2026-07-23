import { Hono } from 'hono';
import * as fs from 'fs';
import * as path from 'path';
import { db } from './db/db';
import { configState } from './db/schema';
import { eq } from 'drizzle-orm';

export async function loadModuleRoutes(app: Hono) {
  let enabledModules: string[] = ['moduler']; // Default fallback

  try {
    const result = db.select().from(configState).where(eq(configState.key, 'enabled_modules')).get();
    if (result && result.value) {
      enabledModules = JSON.parse(result.value);
    }
  } catch (e) {
    console.error('Failed to get enabled modules on startup:', e);
  }

  const MODULES_DIR = path.join(process.cwd(), 'modules');

  if (!fs.existsSync(MODULES_DIR)) return;

  for (const moduleId of enabledModules) {
    const serverFilePath = path.join(MODULES_DIR, moduleId, 'server.ts');
    
    // We check if the server.ts file exists for this module before importing
    if (fs.existsSync(serverFilePath)) {
      try {
        // Dynamically import the module's server file
        const moduleExports = await import(`../modules/${moduleId}/server.ts`);
        const moduleRouter = moduleExports.default;

        if (moduleRouter) {
          app.route(`/api/m/${moduleId}`, moduleRouter);
          console.log(`Loaded API routes for module: ${moduleId}`);
        } else {
          console.warn(`Module ${moduleId} server.ts does not export a Hono router as default.`);
        }
      } catch (e) {
        console.error(`Failed to load API for module ${moduleId}:`, e);
      }
    }
  }
}
