import {$} from 'bun';

/**
 * Stops a tracker still running from an earlier `bun start` or `bun run dev` (a terminal left open, say), so this one
 * can take the port. It asks the operating system which process holds the port, and stops it only when that process
 * answers like the tracker, never whatever else happens to hold the port.
 */
export async function stopPreviousServerAsync(port: number): Promise<void> {
  if (!(await isTrackerListeningAsync(port))) {
    return;
  }
  const pid = await findListeningPidAsync(port);
  if (pid === null || pid === process.pid) {
    return;
  }
  process.kill(pid);
  for (let waited = 0; waited < 3000 && (await isTrackerListeningAsync(port)); waited += 100) {
    await Bun.sleep(100);
  }
  console.log(`Stopped the tracker that was already running on port ${port} (process ${pid})`);
}

async function isTrackerListeningAsync(port: number): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:${port}/api/tickets`, {signal: AbortSignal.timeout(1000)});
    return response.ok;
  } catch {
    return false;
  }
}

/** The process listening on the port: `netstat -ano` on Windows, `lsof` on macOS and Linux. */
async function findListeningPidAsync(port: number): Promise<number | null> {
  if (process.platform === 'win32') {
    // "  TCP    0.0.0.0:4100    0.0.0.0:0    LISTENING    1234"
    const output = await $`netstat -ano -p tcp`.nothrow().quiet().text();
    for (const line of output.split('\n')) {
      const [, local, , state, pid] = line.trim().split(/\s+/);
      if (state === 'LISTENING' && local?.endsWith(`:${port}`)) {
        return Number(pid);
      }
    }
    return null;
  }
  const output = await $`lsof -nP -iTCP:${port} -sTCP:LISTEN -t`.nothrow().quiet().text();
  const pid = Number(output.trim().split('\n')[0]);
  return Number.isInteger(pid) && pid > 0 ? pid : null;
}
