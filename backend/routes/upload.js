const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../utils/cloudinary");
const sendEmail = require("../utils/sendEmail");
const upload = multer({ storage });

const File = require("../models/File");

// POST route to upload image and save to DB
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { degree, regulation, semester, branch, subject, examType } =
      req.body;
    console.log("Data from frontend: "+req.body);
    // Validate required fields
    if (
      !req.file ||
      !degree ||
      !regulation ||
      !semester ||
      !branch ||
      !subject ||
      !examType
    ) {
      return res
        .status(400)
        .json({
          message: "All fields including subject and image are required",
        });
    }

    // Allow only image MIME types
    const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedImageTypes.includes(req.file.mimetype)) {
      return res
        .status(400)
        .json({ message: "Only JPG, PNG, or WEBP image files are allowed." });
    }

    // Save with status = pending (for manual verification)
    const fileUrl = req.file.path;
    const newFile = new File({
      fileUrl,
      degree,
      regulation,
      semester,
      branch,
      subject,
      status: "pending",
      examType,
    });

    await newFile.save();

    // Send confirmation email to admin
    const approveLink = `https://jntuh-backend.onrender.com/api/verify/${newFile._id}/approve`;
    const rejectLink = `https://jntuh-backend.onrender.com/api/verify/${newFile._id}/reject`;
    // const approveLink = `http://localhost:5000/api/verify/${newFile._id}/approve`;
    // const rejectLink = `http://localhost:5000/api/verify/${newFile._id}/reject`;

    // await sendEmail({
    //   to: process.env.ADMIN_EMAIL,
    //   subject: "New Paper Uploaded - Verification Required",
    //   html: `
    //     <h3>New Paper Uploaded</h3>
    //     <p><strong>Degree:</strong> ${degree}</p>
    //     <p><strong>Regulation:</strong> ${regulation}</p>
    //     <p><strong>Semester:</strong> ${semester}</p>
    //     <p><strong>Branch:</strong> ${branch}</p>
    //     <p><strong>Subject:</strong> ${subject}</p>
    //     <p><strong>Exam Type:</strong> ${examType}</p>
    //     <p><strong>File:</strong> <a href="${fileUrl}" target="_blank">View File</a></p>
    //     <p>
    //       <a href="${approveLink}" style="padding:10px 15px;background:#28a745;color:#fff;text-decoration:none;margin-right:10px;">Approve Paper</a>
    //       <a href="${rejectLink}" style="padding:10px 15px;background:#dc3545;color:#fff;text-decoration:none;">Reject Paper</a>
    //     </p>
    //   `,
    // });

    res
      .status(201)
      .json({ message: "Image uploaded for review", file: newFile });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
