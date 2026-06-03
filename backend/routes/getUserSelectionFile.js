const express = require("express");
const router = express.Router();

const File = require("../models/File");
const { getfileCacheMiddleware } = require("../middlewares/cache.middleware");

// Cache-aside: Redis checked before this handler runs (see cache.middleware.js)
router.get("/", getfileCacheMiddleware(), async (req, res) => {
  try {
    const {
      degree,
      regulation,
      semester,
      branch,
      status,
      subject,
      examType,
    } = req.query;

    const filter = {};
    if (degree) filter.degree = degree;
    if (regulation) filter.regulation = regulation;
    if (semester) {
      const semNum = semester.replace("Semester ", "").trim();
      filter.semester = { $in: [semNum, `Semester ${semNum}`] };
    }
    if (branch) filter.branch = branch;
    if (status) filter.status = status;
    if (subject) filter.subject = subject;
    if (examType) filter.examType = examType;

    const files = await File.find(filter).sort({ createdAt: -1 });
    res.status(200).json(files);
  } catch (err) {
    console.error("Fetch Files Error:", err);
    res.status(500).json({ message: "Failed to fetch files" });
  }
});

module.exports = router;
