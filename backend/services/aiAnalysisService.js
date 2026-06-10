/**
 * AI analysis service — compares uploaded paper metadata against content
 * visible in the Cloudinary exam paper image using Groq Vision.
 *
 * Returns a structured match report (in memory only — never persisted to MongoDB).
 */

const Groq = require("groq-sdk");

// llama-3.2-11b-vision-preview was decommissioned Apr 2025 — use Llama 4 Scout
const DEFAULT_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const MATCH_REPORT_SCHEMA = {
  overallMatch: "number 0-100",
  degreeMatch: "number 0-100",
  regulationMatch: "number 0-100",
  branchMatch: "number 0-100",
  semesterMatch: "number 0-100",
  subjectMatch: "number 0-100",
  examTypeMatch: "number 0-100",
  notes: "array of short strings",
};

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }
  return new Groq({ apiKey });
}

function buildAnalysisPrompt(metadata) {
  const { degree, regulation, branch, semester, subject, examType } = metadata;

  return `You are an exam paper metadata validator for JNTUH university papers.

Examine the exam paper image and extract visible metadata (degree, regulation, branch, semester, subject, exam type).

Compare what you find in the image against the student-uploaded metadata below:

Uploaded metadata:
- Degree: ${degree}
- Regulation: ${regulation}
- Branch: ${branch}
- Semester: ${semester}
- Subject: ${subject}
- Exam Type: ${examType}

For each field, assign a match score from 0 to 100 (100 = exact or clear match).
Calculate overallMatch as a weighted average of all field scores.

Return ONLY valid JSON with this exact structure (no markdown, no extra text):
{
  "overallMatch": <number>,
  "degreeMatch": <number>,
  "regulationMatch": <number>,
  "branchMatch": <number>,
  "semesterMatch": <number>,
  "subjectMatch": <number>,
  "examTypeMatch": <number>,
  "notes": ["short note about each finding or mismatch"]
}

Important:
- You are ONLY generating a report. Do NOT approve or reject the paper.
- If text is unclear, note it and give a lower score.
- Abbreviations (e.g. CSE, ECE, R22) should be matched intelligently.`;
}

function parseMatchReport(rawContent) {
  if (!rawContent || typeof rawContent !== "string") {
    throw new Error("Empty response from AI model");
  }

  let jsonStr = rawContent.trim();

  // Strip markdown code fences if present
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim();
  }

  const report = JSON.parse(jsonStr);

  const requiredFields = Object.keys(MATCH_REPORT_SCHEMA).filter((k) => k !== "notes");
  for (const field of requiredFields) {
    const val = report[field];
    if (typeof val !== "number" || val < 0 || val > 100) {
      throw new Error(`Invalid or missing field: ${field}`);
    }
  }

  if (!Array.isArray(report.notes)) {
    report.notes = [];
  }

  report.notes = report.notes.map(String);

  return report;
}

/**
 * Run Groq Vision analysis on the paper image.
 *
 * @param {Object} paper - File document from MongoDB
 * @returns {Promise<Object>} Match report
 */
async function analyzePaper(paper) {
  const groq = getGroqClient();
  const model = process.env.GROQ_VISION_MODEL || DEFAULT_VISION_MODEL;

  const metadata = {
    degree: paper.degree,
    regulation: paper.regulation,
    branch: paper.branch,
    semester: paper.semester,
    subject: paper.subject,
    examType: paper.examType,
  };

  const prompt = buildAnalysisPrompt(metadata);

  const response = await groq.chat.completions.create({
    model,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: { url: paper.fileUrl },
          },
        ],
      },
    ],
    temperature: 0.1,
    max_tokens: 1024,
  });

  const content = response.choices?.[0]?.message?.content;
  return parseMatchReport(content);
}

/**
 * Attempt analysis with one retry on parse failure.
 *
 * @param {Object} paper
 * @returns {Promise<Object>} Match report
 */
async function analyzePaperWithRetry(paper) {
  try {
    return await analyzePaper(paper);
  } catch (firstError) {
    console.warn(
      `[aiAnalysis] First attempt failed for paper ${paper._id}:`,
      firstError.message
    );

    const groq = getGroqClient();
    const model = process.env.GROQ_VISION_MODEL || DEFAULT_VISION_MODEL;

    const retryResponse = await groq.chat.completions.create({
      model,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `${buildAnalysisPrompt({
                degree: paper.degree,
                regulation: paper.regulation,
                branch: paper.branch,
                semester: paper.semester,
                subject: paper.subject,
                examType: paper.examType,
              })}\n\nRespond with ONLY raw JSON. No markdown.`,
            },
            {
              type: "image_url",
              image_url: { url: paper.fileUrl },
            },
          ],
        },
      ],
      temperature: 0,
      max_tokens: 1024,
    });

    const content = retryResponse.choices?.[0]?.message?.content;
    return parseMatchReport(content);
  }
}

module.exports = {
  analyzePaperWithRetry,
  parseMatchReport,
};
