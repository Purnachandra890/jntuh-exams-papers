const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../utils/cloudinary");
const upload = multer({ storage });

const File = require("../models/File");

router.get("/", async (req, res) => {
  try {
    const { degree, regulation, semester, branch, status, subject } = req.query;

    const filter = {};
    if (degree) filter.degree = degree;
    if (regulation) filter.regulation = regulation;
    if (semester) filter.semester = semester;
    if (branch) filter.branch = branch;
    if (status) filter.status = status;
    if (subject) filter.subject = subject;

    const files = await File.find(filter).sort({ createdAt: -1 });
    res.status(200).json(files);
  } catch (err) {
    console.error("Fetch Files Error:", err);
    res.status(500).json({ message: "Failed to fetch files" });
  }
});

module.exports = router;
