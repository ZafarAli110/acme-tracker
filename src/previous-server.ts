import {$} from 'bun';

/**
 * Frees the port from a tracker still running from an earlier `bun start` or `bun run dev` (a terminal left open, or
 * one paused with Ctrl+Z, which keeps the port but never answers), so this one can take it. It stops a process only
 * when it answers like the tracker, or is this repository's `bun src/server.ts`; anything else holding the port is
 * named, with the command that stops it, and left alone.
 */
export async function stopPreviousServerAsync(port: number): Promise<void> {
  const pid = await findListeningPidAsync(port);
  if (pid === null || pid === process.pid) {
    return;
  }
  const isAnswering = await isTrackerListeningAsync(port);
  if (!isAnswering && !(await isTrackerProcessAsync(pid))) {
    console.error(
      `Port ${port} is in use by process ${pid}, which is not the tracker. Stop it, then start again:\n` +
        `  macOS:   kill ${pid}\n` +
        `  Windows: Stop-Process -Id ${pid}`,
    );
    process.exit(1);
  }
  process.kill(pid);
  if (!(await waitForPortFreeAsync(port, 3000))) {
    // A paused or hung process ignores a polite stop.
    process.kill(pid, 'SIGKILL');
    await waitForPortFreeAsync(port, 3000);
  }
  const how = isAnswering ? 'already running' : 'no longer answering';
  console.log(`Stopped the tracker that was ${how} on port ${port} (process ${pid})`);
}

async function waitForPortFreeAsync(port: number, timeoutMs: number): Promise<boolean> {
  for (let waited = 0; waited < timeoutMs; waited += 100) {
    if ((await findListeningPidAsync(port)) === null) {
      return true;
    }
    await Bun.sleep(100);
  }
  return false;
}

async function isTrackerListeningAsync(port: number): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:${port}/api/tickets`, {signal: AbortSignal.timeout(1000)});
    return response.ok;
  } catch {
    return false;
  }
}

/** Whether the process is `bun src/server.ts` run from this repository: the tracker, even when it no longer answers. */
async function isTrackerProcessAsync(pid: number): Promise<boolean> {
  if (process.platform === 'win32') {
    const query = `(Get-CimInstance Win32_Process -Filter "ProcessId=${pid}").CommandLine`;
    const commandLine = await $`powershell -NoProfile -Command ${query}`.nothrow().quiet().text();
    return isServerCommand(commandLine);
  }
  const commandLine = await $`ps -p ${pid} -o command=`.nothrow().quiet().text();
  // "p1234\nfcwd\nn/Users/…/acme-tracker": the line that starts with n is the folder it runs in.
  const cwdOutput = await $`lsof -a -p ${pid} -d cwd -Fn`.nothrow().quiet().text();
  const directory =
    cwdOutput
      .split('\n')
      .find((line) => line.startsWith('n'))
      ?.slice(1) ?? '';
  return isServerCommand(commandLine) && directory === process.cwd();
}

function isServerCommand(commandLine: string): boolean {
  return /\bbun(\.exe)?["']?\s.*src[\\/]server\.ts/.test(commandLine);
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
