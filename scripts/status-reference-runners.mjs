#!/usr/bin/env node
import { join } from 'node:path';
import {
  PUBLIC_RUNNERS,
  assessRunnerHealth,
  readRunnerStatus,
  readJson,
} from './lib/reference-runners-shared.mjs';

async function main() {
  const runners = await readJson(PUBLIC_RUNNERS, []);
  const statusMap = await readRunnerStatus();

  console.log('Reference runner status');
  console.log('──────────────────────');

  if (!runners.length) {
    console.log('No runners discovered. Run: node scripts/discover-reference-runners.mjs');
    return;
  }

  for (const runner of runners) {
    if (!runner.runnable) continue;
    const live = statusMap?.[runner.id] ?? {};
    const health = await assessRunnerHealth(runner, live);
    const logFile = live?.logFile ?? join('.raw-reference-runners/logs', `${runner.id}.log`);

    console.log(`id:       ${runner.id}`);
    console.log(`port:     ${runner.port}`);
    console.log(`status:   ${health.status}`);
    console.log(`url:      ${health.expectedUrl}`);
    console.log(`pid:      ${health.pid ?? '—'}`);
    console.log(`responding: ${health.responding ? 'yes' : 'no'}`);
    console.log(`log file: ${logFile}`);
    if (health.note) console.log(`note:     ${health.note}`);
    if (live?.observedUrl) console.log(`observed: ${live.observedUrl}`);
    if (live?.startMode) console.log(`start mode: ${live.startMode}`);
    if (live?.buildStatus) console.log(`build:    ${live.buildStatus}`);
    if (live?.serveTarget) console.log(`serve:    ${live.serveTarget}`);
    if (live?.generatedWrapper) console.log(`wrapper:  generated`);
    console.log('');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
