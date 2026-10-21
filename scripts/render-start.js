#!/usr/bin/env node
/**
 * Runs the NestJS backend and the Next.js frontend in one container (Render web service).
 *
 * - Next.js binds to $PORT (the only port Render exposes publicly).
 * - NestJS binds to the port in $BACKEND_INTERNAL_URL (default http://127.0.0.1:3001),
 *   reachable only inside the container; Next.js proxies /api/v1/* to it (see
 *   frontend/next.config.js rewrites). Rewrites are baked in at `next build`, so the
 *   same BACKEND_INTERNAL_URL must be set at build and at runtime.
 * - If either process exits, the other is stopped and this script exits non-zero
 *   so Render restarts the service instead of leaving it half-alive.
 */
const { spawn } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const publicPort = process.env.PORT || '3000';
const backendPort = new URL(process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:3001').port;

const nextBin = require.resolve('next/dist/bin/next', { paths: [path.join(root, 'frontend')] });

const children = [
  {
    name: 'backend',
    proc: spawn(process.execPath, [path.join(root, 'backend/dist/main.js')], {
      cwd: path.join(root, 'backend'),
      env: { ...process.env, PORT: backendPort },
      stdio: 'inherit',
    }),
  },
  {
    name: 'frontend',
    proc: spawn(process.execPath, [nextBin, 'start', '-p', publicPort, '-H', '0.0.0.0'], {
      cwd: path.join(root, 'frontend'),
      env: { ...process.env, PORT: publicPort },
      stdio: 'inherit',
    }),
  },
];

let exitCode = null;

function stopAll(code) {
  if (exitCode !== null) return;
  exitCode = code;
  for (const { proc } of children) {
    if (proc.exitCode === null && proc.signalCode === null) proc.kill('SIGTERM');
  }
  // Force exit if a child ignores SIGTERM.
  setTimeout(() => process.exit(exitCode), 10000).unref();
}

for (const { name, proc } of children) {
  proc.on('exit', (code, signal) => {
    if (exitCode === null) {
      console.error(`[render-start] ${name} exited (code=${code}, signal=${signal}); stopping service`);
      stopAll(code || 1);
    }
    if (children.every((c) => c.proc.exitCode !== null || c.proc.signalCode !== null)) {
      process.exit(exitCode);
    }
  });
}

process.on('SIGTERM', () => stopAll(0));
process.on('SIGINT', () => stopAll(0));

console.log(`[render-start] frontend on :${publicPort}, backend on 127.0.0.1:${backendPort}`);
