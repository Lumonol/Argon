import { Hono } from 'hono';
import * as fs from 'fs';
import * as path from 'path';
import { db } from '../db/db';
import { configState } from '../db/schema';
import { eq } from 'drizzle-orm';

export const modulesRouter = new Hono();

const MODULES_DIR = path.join(process.cwd(), 'modules');

interface Submodule {
  id: string;
  name: string;
  icon?: string;
  route?: string;
}

interface ModuleManifest {
  id: string;
  name: string;
  description: string;
  icon?: string;
  route?: string;
  submodules?: Submodule[];
}

modulesRouter.get('/', async (c) => {
  const modules: ModuleManifest[] = [];

  if (fs.existsSync(MODULES_DIR)) {
    const entries = fs.readdirSync(MODULES_DIR, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const manifestPath = path.join(MODULES_DIR, entry.name, 'manifest.json');
        if (fs.existsSync(manifestPath)) {
          try {
            const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
            const manifest: ModuleManifest = JSON.parse(manifestContent);
            modules.push(manifest);
          } catch (e) {
            console.error(`Failed to parse manifest for module ${entry.name}:`, e);
          }
        }
      }
    }
  }

  return c.json({ modules });
});

modulesRouter.get('/enabled', async (c) => {
  try {
    const result = db.select().from(configState).where(eq(configState.key, 'enabled_modules')).get();
    if (result && result.value) {
      return c.json({ enabledModules: JSON.parse(result.value) });
    }
  } catch (e) {
    console.error('Failed to get enabled modules:', e);
  }
  
  return c.json({ enabledModules: ['moduler', 'home'] }); // default
});

modulesRouter.post('/enabled', async (c) => {
  const { enabledModules } = await c.req.json();
  
  if (!Array.isArray(enabledModules)) {
    return c.json({ error: 'enabledModules must be an array' }, 400);
  }

  try {
    const existing = db.select().from(configState).where(eq(configState.key, 'enabled_modules')).get();
    
    if (existing) {
      db.update(configState)
        .set({ value: JSON.stringify(enabledModules), updatedAt: new Date() })
        .where(eq(configState.key, 'enabled_modules'))
        .run();
    } else {
      db.insert(configState)
        .values({ key: 'enabled_modules', value: JSON.stringify(enabledModules), updatedAt: new Date() })
        .run();
    }
    
    return c.json({ success: true, enabledModules });
  } catch (e) {
    console.error('Failed to update enabled modules:', e);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// @ts-ignore
import AdmZip from 'adm-zip';

modulesRouter.post('/install', async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'] as File;

    if (!file) {
      return c.json({ error: 'No file uploaded' }, 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Read the zip
    const zip = new AdmZip(buffer);
    
    // Find manifest.json to get the module ID
    const zipEntries = zip.getEntries();
    let manifestEntry = zipEntries.find(e => e.entryName === 'manifest.json');
    let baseDir = '';

    // Sometimes zips have a root folder (e.g. 'helpdesk/manifest.json')
    if (!manifestEntry) {
      manifestEntry = zipEntries.find(e => e.entryName.endsWith('/manifest.json'));
      if (manifestEntry) {
        baseDir = manifestEntry.entryName.replace('manifest.json', '');
      }
    }

    if (!manifestEntry) {
      return c.json({ error: 'Invalid module: Missing manifest.json in the zip archive' }, 400);
    }

    const manifestContent = zip.readAsText(manifestEntry);
    const manifest = JSON.parse(manifestContent);
    const moduleId = manifest.id;

    if (!moduleId || typeof moduleId !== 'string') {
      return c.json({ error: 'Invalid module: manifest.json is missing a valid "id" field' }, 400);
    }

    const targetDir = path.join(MODULES_DIR, moduleId);

    // If it exists, delete it first (overwrite)
    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true });
    }
    
    fs.mkdirSync(targetDir, { recursive: true });

    // Extract entries, skipping the baseDir prefix if any
    for (const entry of zipEntries) {
      if (entry.isDirectory) continue;
      
      const entryName = entry.entryName;
      if (baseDir && !entryName.startsWith(baseDir)) continue;
      
      const relativePath = baseDir ? entryName.substring(baseDir.length) : entryName;
      const fullPath = path.join(targetDir, relativePath);
      
      const entryDir = path.dirname(fullPath);
      if (!fs.existsSync(entryDir)) {
        fs.mkdirSync(entryDir, { recursive: true });
      }
      
      fs.writeFileSync(fullPath, entry.getData());
    }

    return c.json({ success: true, message: `Module ${moduleId} installed successfully`, manifest });
  } catch (error: any) {
    console.error('Failed to install module:', error);
    return c.json({ error: error.message || 'Failed to install module' }, 500);
  }
});

// Module Settings API
modulesRouter.get('/:id/settings', async (c) => {
  const { id } = c.req.param();
  const configKey = `module_settings_${id}`;
  
  try {
    const result = db.select().from(configState).where(eq(configState.key, configKey)).get();
    if (result && result.value) {
      return c.json({ settings: JSON.parse(result.value) });
    }
    return c.json({ settings: {} });
  } catch (e) {
    console.error(`Failed to get settings for module ${id}:`, e);
    return c.json({ settings: {} });
  }
});

modulesRouter.post('/:id/settings', async (c) => {
  const { id } = c.req.param();
  const configKey = `module_settings_${id}`;
  
  try {
    const body = await c.req.json();
    const existing = db.select().from(configState).where(eq(configState.key, configKey)).get();
    
    if (existing) {
      db.update(configState)
        .set({ value: JSON.stringify(body.settings), updatedAt: new Date() })
        .where(eq(configState.key, configKey))
        .run();
    } else {
      db.insert(configState)
        .values({ key: configKey, value: JSON.stringify(body.settings), updatedAt: new Date() })
        .run();
    }
    
    return c.json({ success: true, settings: body.settings });
  } catch (e) {
    console.error(`Failed to update settings for module ${id}:`, e);
    return c.json({ error: 'Internal server error' }, 500);
  }
});
