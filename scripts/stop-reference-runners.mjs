#!/usr/bin/env node
import {
  PIDS_FILE,
  killPid,
  readRunnerStatus,
  writeRunnerStatus,
  readJson,
  writeJson,
} from './lib/reference-runners-shared.mjs';

function parseArgs(argv) {
  const opts = { all: false, ids: [] };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--all') opts.all = true;
    else if (arg === '--id') opts.ids.push(argv[++i]);
    else if (arg === '--help' || arg === '-h') opts.help = true;
  }
  return opts;
}

function printUsage() {
  console.log(`Usage:
  node scripts/stop-reference-runners.mjs --id <runner-id>
  node scripts/stop-reference-runners.mjs --all

Examples:
  node scripts/stop-reference-runners.mjs --id liquid-dom
  node scripts/stop-reference-runners.mjs --all`);
}

async function main() {
  const opts = parseArgs(process.argv);
  if (opts.help || (!opts.all && !opts.ids.length)) {
    printUsage();
    process.exit(opts.help ? 0 : 1);
  }

  const pidsMap = (await readJson(PIDS_FILE, {})) ?? {};
  const statusMap = await readRunnerStatus();
  const targetIds = opts.all ? Object.keys(pidsMap) : opts.ids;
  const stopped = [];

  for (const id of targetIds) {
    const pid = pidsMap[id];
    if (!pid) {
      console.log(`No tracked PID for ${id}`);
      if (statusMap[id]) {
        statusMap[id] = { ...statusMap[id], status: 'stopped', pid: null, responding: false };
      }
      delete pidsMap[id];
      continue;
    }

    const killed = await killPid(pid);
    if (killed) {
      stopped.push({ id, pid });
      console.log(`Stopped ${id} (pid ${pid})`);
    } else {
      console.log(`Could not stop ${id} (pid ${pid})`);
    }

    if (statusMap[id]) {
      statusMap[id] = {
        ...statusMap[id],
        status: 'stopped',
        pid: null,
        responding: false,
      };
    }
    delete pidsMap[id];
  }

  await writeJson(PIDS_FILE, pidsMap);
  await writeRunnerStatus(statusMap);

  if (!stopped.length) {
    console.log('No running reference runners stopped.');
  } else {
    console.log(`\nStopped ${stopped.length} runner(s).`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
