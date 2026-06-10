/**
 * BullMQ queue for asynchronous exam paper AI analysis.
 * Queue name: paper-analysis
 *
 * The Express upload route enqueues jobs here; the worker process consumes them.
 */

const { Queue } = require("bullmq");
const { getBullmqConnection } = require("../config/bullmqConnection");

const QUEUE_NAME = "paper-analysis";

/** Default job options: 3 retries, exponential backoff, auto-cleanup */
const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 5000,
  },
  removeOnComplete: true,
  removeOnFail: {
    age: 7 * 24 * 3600, // keep failed jobs for 7 days
  },
};

let queue = null;

function getPaperAnalysisQueue() {
  if (queue) return queue;

  queue = new Queue(QUEUE_NAME, {
    connection: getBullmqConnection(),
    defaultJobOptions: DEFAULT_JOB_OPTIONS,
  });

  return queue;
}

/**
 * Enqueue a paper for background analysis.
 * Uses paperId as jobId to avoid duplicate jobs for the same upload.
 *
 * @param {string} paperId - MongoDB File document _id
 */
async function enqueuePaperAnalysis(paperId) {
  const q = getPaperAnalysisQueue();
  const job = await q.add(
    "analyze",
    { paperId: String(paperId) },
    { jobId: String(paperId) }
  );
  console.log(`[paper-analysis] Job enqueued: ${job.id} for paper ${paperId}`);
  return job;
}

module.exports = {
  QUEUE_NAME,
  getPaperAnalysisQueue,
  enqueuePaperAnalysis,
  DEFAULT_JOB_OPTIONS,
};
