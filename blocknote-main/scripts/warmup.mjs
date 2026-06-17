import { setTimeout as sleep } from "timers/promises";

const BASE_URL = "http://localhost:5000";
const ROUTES = ["/", "/sign-in", "/sign-up", "/dashboard"];

async function waitForServer(maxMs = 60000) {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE_URL}/`, {
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok || res.status < 500) return true;
    } catch {
      // not ready yet
    }
    await sleep(500);
  }
  return false;
}

async function warmup() {
  process.stdout.write("[warmup] Waiting for server");
  const ready = await waitForServer();
  if (!ready) {
    console.log("\n[warmup] Server did not respond in time, skipping.");
    process.exit(0);
  }
  console.log(" ready!");

  for (const route of ROUTES) {
    try {
      process.stdout.write(`[warmup] Pre-compiling ${route} ... `);
      const res = await fetch(`${BASE_URL}${route}`, {
        signal: AbortSignal.timeout(60000),
      });
      console.log(`${res.status}`);
    } catch (e) {
      console.log(`failed (${e.message})`);
    }
  }
  console.log("[warmup] All routes pre-compiled.");
}

warmup();
