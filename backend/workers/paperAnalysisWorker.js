/**
 * BullMQ worker — processes paper-analysis jobs.
 *
 * Flow per job:
 * 1. Receive paperId from job data
 * 2. Fetch paper from MongoDB
 * 3. Attempt AI analysis (Groq Vision on Cloudinary image URL)
 * 4. Send admin email via existing Brevo service (ALWAYS — even if AI fails)
 *
 * AI never approves or rejects. Report is generated in memory only.
 */

const { Worker } = require("bullmq");
const { getBullmqConnection } = require("../config/bullmqConnection");
const { QUEUE_NAME } = require("../queues/paperAnalysisQueue");
const File = require("../models/File");
const { analyzePaperWithRetry } = require("../services/aiAnalysisService");
const { sendAdminReviewEmail } = require("../services/emailService");

/**
 * Process a single paper analysis job.
 */
async function processPaperAnalysisJob(job) {
  const { paperId } = job.data;
  const startTime = Date.now();

  console.log(`[paperAnalysisWorker] Processing job ${job.id} for paper ${paperId}`);

  // Step 1: Fetch paper from MongoDB
  const paper = await File.findById(paperId);
  if (!paper) {
    const err = new Error(`Paper not found: ${paperId}`);
    console.error(`[paperAnalysisWorker] ${err.message}`);
    throw err;
  }

  // Step 2: Attempt AI analysis — failure must NOT block the email
  let report = null;
  try {
    report = await analyzePaperWithRetry(paper);
    console.log(
      `[paperAnalysisWorker] AI report generated for ${paperId} — overallMatch: ${report.overallMatch}%`
    );
  } catch (aiError) {
    console.error(
      `[paperAnalysisWorker] AI analysis failed for ${paperId}:`,
      aiError.message
    );
    // report stays null — email will include fallback notice
  }

  // Step 3: Always send admin email (with or without AI report)
  try {
    await sendAdminReviewEmail(paper, report);
  } catch (emailError) {
    console.error(
      `[paperAnalysisWorker] Email failed for ${paperId}:`,
      emailError.message
    );
    // Email failure should trigger BullMQ retry
    throw emailError;
  }

  const durationMs = Date.now() - startTime;
  console.log(
    `[paperAnalysisWorker] Job ${job.id} completed in ${durationMs}ms` +
      (report ? ` (AI match: ${report.overallMatch}%)` : " (no AI report)")
  );

  return {
    paperId,
    aiSuccess: report !== null,
    overallMatch: report?.overallMatch ?? null,
    durationMs,
  };
}

/**
 * Start the worker. Call from worker.js after MongoDB connects.
 */
function startPaperAnalysisWorker() {
  const connection = getBullmqConnection();

  const worker = new Worker(QUEUE_NAME, processPaperAnalysisJob, {
    connection,
    concurrency: parseInt(process.env.PAPER_ANALYSIS_CONCURRENCY, 10) || 2,
  });

  worker.on("completed", (job, result) => {
    console.log(
      `[paperAnalysisWorker] Job completed: id=${job.id} paperId=${result?.paperId} aiSuccess=${result?.aiSuccess} duration=${result?.durationMs}ms`
    );
  });

  worker.on("failed", (job, err) => {
    console.error(
      `[paperAnalysisWorker] Job failed: id=${job?.id} paperId=${job?.data?.paperId} attempt=${job?.attemptsMade}/${job?.opts?.attempts} error=${err.message}`
    );
  });

  worker.on("error", (err) => {
    console.error("[paperAnalysisWorker] Worker error:", err.message);
  });

  console.log(`[paperAnalysisWorker] Listening on queue "${QUEUE_NAME}"`);
  return worker;
}

module.exports = {
  startPaperAnalysisWorker,
  processPaperAnalysisJob,
};
