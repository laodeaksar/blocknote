import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

// Baris presence tertinggal saat tab ditutup paksa; bersihkan berkala.
crons.interval("cleanup stale presence", { minutes: 5 }, api.presence.cleanupStale, {});

export default crons;