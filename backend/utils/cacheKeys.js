/**
 * Builds stable Redis cache keys for GET /api/getfile.
 * Keys include every query param that affects the MongoDB filter so
 * different filter combinations never share the same cache entry.
 */

const CACHE_PREFIX = "papers:getfile:v1";

const FILTER_PARAMS = [
  "branch",
  "degree",
  "examType",
  "regulation",
  "semester",
  "status",
  "subject",
];

/** Match getUserSelectionFile semester normalization for consistent keys. */
function normalizeSemester(semester) {
  if (!semester) return null;
  const semNum = String(semester).replace("Semester ", "").trim();
  return `sem${semNum}`;
}

function normalizeValue(key, value) {
  if (value == null || value === "") return null;
  const trimmed = String(value).trim();
  if (key === "semester") return normalizeSemester(trimmed);
  return trimmed;
}

/**
 * Canonical string: sorted param=value pairs joined with "|".
 * Example: branch=CSE|degree=B.Tech|examType=Mid-1|regulation=R18|semester=sem3|status=verified
 */
function buildGetfileCacheKey(query = {}) {
  const segments = [];

  for (const param of FILTER_PARAMS) {
    const normalized = normalizeValue(param, query[param]);
    if (normalized != null) {
      segments.push(`${param}=${normalized}`);
    }
  }

  if (segments.length === 0) {
    return `${CACHE_PREFIX}:all`;
  }

  return `${CACHE_PREFIX}:${segments.join("|")}`;
}

function getGetfileCachePattern() {
  return `${CACHE_PREFIX}:*`;
}

module.exports = {
  CACHE_PREFIX,
  FILTER_PARAMS,
  buildGetfileCacheKey,
  getGetfileCachePattern,
  normalizeSemester,
};
