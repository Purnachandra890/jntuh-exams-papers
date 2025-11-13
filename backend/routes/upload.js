const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const sendEmail = require("../utils/sendEmail");
const File = require("../models/File");

// fetching backend api
const backendUrl = process.env.BACKEND_URL;

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage for Multer
const upload = multer({ storage: multer.memoryStorage() });

// Upload helper function
async function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "uploads",
        resource_type: "image",
      },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// Upload Route
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { degree, regulation, semester, branch, subject, examType } =
      req.body;

    // Validation
    if (!req.file)
      return res.status(400).json({ message: "Image file is required" });

    if (!degree || !regulation || !semester || !branch || !subject || !examType)
      return res.status(400).json({ message: "All fields are required" });

    // Upload to Cloudinary
    const uploaded = await uploadToCloudinary(req.file.buffer);
    const fileUrl = uploaded.secure_url;

    // Save to DB
    const newFile = new File({
      fileUrl,
      degree,
      regulation,
      semester,
      branch,
      subject,
      examType,
      status: "pending",
    });

    await newFile.save();

    // Email notification to Admin
    const approveLink = `${backendUrl}/api/verify/${newFile._id}/approve`;
    const rejectLink = `${backendUrl}/api/verify/${newFile._id}/reject`;

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "New Paper Uploaded - Verification Required",
      html: `
        <h3>New Paper Uploaded</h3>
        <p><strong>Degree:</strong> ${degree}</p>
        <p><strong>Regulation:</strong> ${regulation}</p>
        <p><strong>Semester:</strong> ${semester}</p>
        <p><strong>Branch:</strong> ${branch}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Exam Type:</strong> ${examType}</p>
        <p><strong>File:</strong> <a href="${fileUrl}" target="_blank">View File</a></p>
        <p>
          <a href="${approveLink}" style="padding:10px 15px;background:#28a745;color:#fff;text-decoration:none;margin-right:10px;">Approve Paper</a>
          <a href="${rejectLink}" style="padding:10px 15px;background:#dc3545;color:#fff;text-decoration:none;">Reject Paper</a>
        </p>
      `,
    });

    res.status(201).json({
      message: "File uploaded successfully and pending review",
      file: newFile,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
