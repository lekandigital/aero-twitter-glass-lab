#!/usr/bin/env node
import { join } from 'node:path';
import {
  PUBLIC_RUNNERS,
  STATUS_FILE,
  readJson,
} from './lib/reference-runners-shared.mjs';

async function isRunning(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const runners = await readJson(PUBLIC_RUNNERS, []);
  const statusMap = await readJson(STATUS_FILE, {});

  console.log('Reference runner status');
  console.log('──────────────────────');

  if (!runners.length) {
    console.log('No runners discovered. Run: node scripts/discover-reference-runners.mjs');
    return;
  }

  for (const runner of runners) {
    if (!runner.runnable) continue;
    const live = statusMap?.[runner.id];
    const pid = live?.pid ?? null;
    const running = await isRunning(pid);
    const status = running ? 'running' : (live?.status ?? runner.status ?? 'not-started');
    const logFile = live?.logFile ?? join('.raw-reference-runners/logs', `${runner.id}.log`);

    console.log(`id:       ${runner.id}`);
    console.log(`port:     ${runner.port}`);
    console.log(`status:   ${status}`);
    console.log(`url:      ${runner.localDevUrl}`);
    console.log(`pid:      ${running ? pid : '—'}`);
    console.log(`log file: ${logFile}`);
    if (live?.error) console.log(`note:     ${live.error}`);
    console.log('');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
