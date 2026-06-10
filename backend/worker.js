/**
 * Standalone BullMQ worker entry point.
 *
 * Run separately from the Express API server:
 *   npm run worker
 *
 * Handles: OCR/LLM analysis + admin email (never runs in the API process).
 */

require("dotenv").config();

const mongoose = require("mongoose");
const { QueueEvents } = require("bullmq");
const { getBullmqConnection, closeBullmqConnection } = require("./config/bullmqConnection");
const { QUEUE_NAME } = require("./queues/paperAnalysisQueue");
const { startPaperAnalysisWorker } = require("./workers/paperAnalysisWorker");

let worker = null;
let queueEvents = null;

async function start() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI is required for the worker process");
    process.exit(1);
  }

  if (!process.env.REDIS_URL) {
    console.error("REDIS_URL is required for BullMQ");
    process.exit(1);
  }

  // Connect to MongoDB (worker needs to read File documents)
  await mongoose.connect(mongoUri);
  console.log("[worker] MongoDB connected");

  // Start job processor
  worker = startPaperAnalysisWorker();

  // QueueEvents for cross-process logging (completed / failed)
  const connection = getBullmqConnection();
  queueEvents = new QueueEvents(QUEUE_NAME, { connection });

  queueEvents.on("completed", ({ jobId, returnvalue }) => {
    console.log(`[QueueEvents] Job ${jobId} completed`, returnvalue || "");
  });

  queueEvents.on("failed", ({ jobId, failedReason }) => {
    console.error(`[QueueEvents] Job ${jobId} failed:`, failedReason);
  });

  console.log("[worker] Paper analysis worker is running. Press Ctrl+C to stop.");
}

async function shutdown(signal) {
  console.log(`[worker] ${signal} received — shutting down...`);

  if (worker) {
    await worker.close();
  }
  if (queueEvents) {
    await queueEvents.close();
  }
  await closeBullmqConnection();
  await mongoose.disconnect();

  console.log("[worker] Shutdown complete");
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start().catch((err) => {
  console.error("[worker] Failed to start:", err);
  process.exit(1);
});
