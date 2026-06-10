/**
 * Admin notification emails for uploaded exam papers.
 * Wraps the existing Brevo sendEmail utility — does NOT use Nodemailer.
 */

const sendEmail = require("../utils/sendEmail");
const { generateVerifyToken } = require("../utils/verifyToken");

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildAiReportSection(report) {
  if (!report) {
    return `
      <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border: 1px solid #ffc107; margin-top: 20px;">
        <h3 style="margin: 0 0 10px; color: #856404;">AI Analysis Report</h3>
        <p style="margin: 0; color: #856404; font-size: 14px;">
          AI analysis could not be completed for this paper. Please review the uploaded paper manually.
        </p>
      </div>
    `;
  }

  const notesHtml =
    report.notes.length > 0
      ? `<ul style="margin: 10px 0 0; padding-left: 20px; color: #444;">
          ${report.notes.map((n) => `<li>${escapeHtml(n)}</li>`).join("")}
         </ul>`
      : "<p style='color: #777; font-size: 14px;'>No additional notes.</p>";

  return `
    <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; border: 1px solid #b8daff; margin-top: 20px;">
      <h3 style="margin: 0 0 12px; color: #004085;">AI Analysis Report</h3>
      <p style="margin: 4px 0; font-size: 15px;"><strong>Overall Match:</strong> ${report.overallMatch}%</p>
      <div style="margin-top: 10px; font-size: 14px; color: #333;">
        <p style="margin: 4px 0;"><strong>Degree Match:</strong> ${report.degreeMatch}%</p>
        <p style="margin: 4px 0;"><strong>Regulation Match:</strong> ${report.regulationMatch}%</p>
        <p style="margin: 4px 0;"><strong>Branch Match:</strong> ${report.branchMatch}%</p>
        <p style="margin: 4px 0;"><strong>Semester Match:</strong> ${report.semesterMatch}%</p>
        <p style="margin: 4px 0;"><strong>Subject Match:</strong> ${report.subjectMatch}%</p>
        <p style="margin: 4px 0;"><strong>Exam Type Match:</strong> ${report.examTypeMatch}%</p>
      </div>
      <p style="margin: 12px 0 4px; font-weight: bold;">AI Notes:</p>
      ${notesHtml}
      <p style="margin: 12px 0 0; font-size: 12px; color: #666; font-style: italic;">
        AI-assisted report only — you must manually approve or reject this paper.
      </p>
    </div>
  `;
}

/**
 * Build the full admin review email HTML.
 *
 * @param {Object} options
 * @param {Object} options.paper - File document
 * @param {Object|null} options.report - AI match report, or null if AI failed
 * @param {Object} options.links - approve/reject URLs via load balancer
 */
function buildAdminReviewEmailHtml({ paper, report, links }) {
  const { approveLink, rejectLink } = links;

  const aiSection = buildAiReportSection(report);

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background: #fafafa;">
      <h2 style="text-align: center; color: #333;">New Exam Paper Uploaded</h2>
      <p style="font-size: 15px; color: #444;">A new exam paper has been uploaded and requires verification.</p>

      <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd; margin-top: 15px;">
        <p style="margin: 6px 0;"><strong>Degree:</strong> ${escapeHtml(paper.degree)}</p>
        <p style="margin: 6px 0;"><strong>Regulation:</strong> ${escapeHtml(paper.regulation)}</p>
        <p style="margin: 6px 0;"><strong>Semester:</strong> ${escapeHtml(paper.semester)}</p>
        <p style="margin: 6px 0;"><strong>Branch:</strong> ${escapeHtml(paper.branch)}</p>
        <p style="margin: 6px 0;"><strong>Subject:</strong> ${escapeHtml(paper.subject)}</p>
        <p style="margin: 6px 0;"><strong>Exam Type:</strong> ${escapeHtml(paper.examType)}</p>
      </div>

      ${aiSection}

      <div style="margin-top: 20px; text-align: center;">
        <a href="${escapeHtml(paper.fileUrl)}"
          style="display: inline-block; margin-top: 10px; padding: 10px 20px;
                  background: #007bff; color: white; text-decoration: none;
                  border-radius: 6px;">
          View Uploaded Paper
        </a>
      </div>

      <div style="margin-top: 25px; text-align: center;">
        <a href="${escapeHtml(approveLink)}"
          style="padding: 12px 24px; background: #28a745; color: white;
                  text-decoration: none; border-radius: 6px; margin-right: 10px;">
          Approve Paper
        </a>
        <a href="${escapeHtml(rejectLink)}"
          style="padding: 12px 24px; background: #dc3545; color: white;
                  text-decoration: none; border-radius: 6px;">
          Reject Paper
        </a>
      </div>

      <p style="font-size: 13px; color: #777; text-align: center; margin-top: 25px;">
        This email was generated automatically. Please verify the paper for accuracy.
      </p>
    </div>
  `;
}

/**
 * Public API base for email action links.
 * Prefer PUBLIC_API_URL (your deployed load balancer), then LOAD_BALANCER_URL.
 */
function getPublicApiBaseUrl() {
  const base =
    process.env.PUBLIC_API_URL ||
    process.env.LOAD_BALANCER_URL ||
    process.env.BACKEND_URL_1;

  if (!base) {
    throw new Error(
      "Set PUBLIC_API_URL or LOAD_BALANCER_URL for approve/reject email links"
    );
  }

  return base.replace(/\/$/, "");
}

function buildVerifyLinks(paperId) {
  const apiBase = getPublicApiBaseUrl();
  const id = String(paperId);

  const approveToken = generateVerifyToken(id, "approve");
  const rejectToken = generateVerifyToken(id, "reject");

  return {
    approveLink: `${apiBase}/api/verify/${id}/approve?token=${approveToken}`,
    rejectLink: `${apiBase}/api/verify/${id}/reject?token=${rejectToken}`,
  };
}

/**
 * Send admin review email with optional AI report.
 * Email is ALWAYS sent — if report is null, a fallback notice is included.
 *
 * @param {Object} paper - File document from MongoDB
 * @param {Object|null} report - AI match report or null when AI failed
 */
async function sendAdminReviewEmail(paper, report = null) {
  const links = buildVerifyLinks(paper._id);
  const html = buildAdminReviewEmailHtml({ paper, report, links });

  const subjectSuffix =
    report != null ? ` — AI Match ${report.overallMatch}%` : "";

  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `New Paper Uploaded - Verification Required${subjectSuffix}`,
    html,
  });

  console.log(
    `[emailService] Admin review email sent for paper ${paper._id}` +
      (report ? ` (overallMatch: ${report.overallMatch}%)` : " (no AI report)")
  );
}

module.exports = {
  sendAdminReviewEmail,
  buildAdminReviewEmailHtml,
  buildVerifyLinks,
};
