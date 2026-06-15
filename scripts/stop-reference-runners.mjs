#!/usr/bin/env node
import {
  PIDS_FILE,
  STATUS_FILE,
  exportPublicStatus,
  readJson,
  writeJson,
} from './lib/reference-runners-shared.mjs';

async function isRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const pidsMap = (await readJson(PIDS_FILE, {})) ?? {};
  const statusMap = (await readJson(STATUS_FILE, {})) ?? {};
  const stopped = [];

  for (const [id, pid] of Object.entries(pidsMap)) {
    if (!pid) continue;
    try {
      process.kill(pid, 'SIGTERM');
      stopped.push({ id, pid });
      console.log(`Stopped ${id} (pid ${pid})`);
    } catch (err) {
      console.log(`Could not stop ${id} (pid ${pid}): ${err.message}`);
    }
    if (statusMap[id]) {
      statusMap[id] = { ...statusMap[id], status: 'stopped', pid: null };
    }
  }

  await writeJson(PIDS_FILE, {});
  await writeJson(STATUS_FILE, statusMap);
  await exportPublicStatus(statusMap);

  if (!stopped.length) {
    console.log('No running reference runners found.');
  } else {
    console.log(`\nStopped ${stopped.length} runner(s).`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
