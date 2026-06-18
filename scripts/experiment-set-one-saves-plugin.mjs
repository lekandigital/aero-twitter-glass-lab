import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SAVES_PATH = join(__dirname, '../src/data/experiment-set-one/saves.json');
const API_PREFIX = '/api/experiment-set-one/saves';

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function readSavesFile() {
  try {
    const raw = readFileSync(SAVES_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSavesFile(saves) {
  mkdirSync(dirname(SAVES_PATH), { recursive: true });
  writeFileSync(SAVES_PATH, `${JSON.stringify(saves, null, 2)}\n`);
}

function sortedRecord(value) {
  const out = {};
  for (const key of Object.keys(value).sort()) out[key] = value[key];
  return out;
}

function fingerprint(snapshot) {
  return JSON.stringify({
    e1: sortedRecord(snapshot.e1),
    e2: sortedRecord(snapshot.e2),
    e3: sortedRecord(snapshot.e3),
    e4: snapshot.e4 ? sortedRecord(snapshot.e4) : null,
  });
}

function dedupeSnapshots(saves) {
  const seen = new Set();
  const next = [];
  for (const save of saves) {
    if (save.cornersOnly) {
      next.push(save);
      continue;
    }
    const fp = fingerprint(save);
    if (seen.has(fp)) continue;
    seen.add(fp);
    next.push(save);
  }
  return next;
}

function upsertSave(saves, snapshot) {
  const idx = saves.findIndex((s) => s.id === snapshot.id);
  if (idx === -1) return dedupeSnapshots([...saves, snapshot]).sort((a, b) => a.id - b.id);
  const next = [...saves];
  next[idx] = snapshot;
  return dedupeSnapshots(next).sort((a, b) => a.id - b.id);
}

function mergeSaves(existing, incoming) {
  let next = [...existing];
  for (const snapshot of incoming) {
    if (!snapshot || typeof snapshot.id !== 'number') continue;
    next = upsertSave(next, snapshot);
  }
  return next;
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export function experimentSetOneSavesPlugin() {
  return {
    name: 'experiment-set-one-saves',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        if (!url.startsWith(API_PREFIX)) return next();

        try {
          if (req.method === 'GET' && url === API_PREFIX) {
            return sendJson(res, 200, readSavesFile());
          }

          if (req.method === 'POST' && url === API_PREFIX) {
            const body = JSON.parse(await readBody(req));
            const saves = upsertSave(readSavesFile(), body);
            writeSavesFile(saves);
            return sendJson(res, 200, saves);
          }

          if (req.method === 'POST' && url === `${API_PREFIX}/merge`) {
            const body = JSON.parse(await readBody(req));
            const incoming = Array.isArray(body) ? body : body?.saves;
            if (!Array.isArray(incoming)) {
              return sendJson(res, 400, { error: 'Expected saves array' });
            }
            const saves = mergeSaves(readSavesFile(), incoming);
            writeSavesFile(saves);
            return sendJson(res, 200, saves);
          }

          return sendJson(res, 404, { error: 'Not found' });
        } catch (err) {
          return sendJson(res, 500, { error: err instanceof Error ? err.message : 'Save failed' });
        }
      });
    },
  };
}
