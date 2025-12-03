const express = require("express");
const router = express.Router();

const File = require("../models/File");

router.get("/", async (req, res) => {
  try {
    const recentPapers = await File.find({ status: "verified" })
      .sort({ createdAt: -1 })
      .limit(10);
    return res.status(200).json(recentPapers);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch recent papers" });
  }
});

module.exports = router;
