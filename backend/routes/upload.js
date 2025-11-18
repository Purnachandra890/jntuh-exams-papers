const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const sharp = require("sharp");
const sendEmail = require("../utils/sendEmail");
const File = require("../models/File");

const backendUrl = process.env.BACKEND_URL;

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer (multiple fields)
const upload = multer({ storage: multer.memoryStorage() }).fields([
  { name: "front", maxCount: 1 },
  { name: "back", maxCount: 1 },
]);

// Upload to Cloudinary
function uploadToCloudinary(buffer) {
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

router.post("/", upload, async (req, res) => {
  try {
    const {
      degree,
      regulation,
      semester,
      branch,
      subject,
      examType,
      paperSides,
    } = req.body;

    const frontFile = req.files.front?.[0];
    const backFile = req.files.back?.[0];

    if (!frontFile) {
      return res.status(400).json({ message: "Front image is required" });
    }

    let finalBuffer;

    if (paperSides === "two") {
      if (!backFile) {
        return res.status(400).json({ message: "Back image is required" });
      }

      // Read image metadata
      const img1 = sharp(frontFile.buffer);
      const img2 = sharp(backFile.buffer);

      const meta1 = await img1.metadata();
      const meta2 = await img2.metadata();

      // Merge into horizontal single image
      finalBuffer = await sharp({
        create: {
          width: meta1.width + meta2.width,
          height: Math.max(meta1.height, meta2.height),
          channels: 3,
          background: "white",
        },
      })
        .composite([
          { input: frontFile.buffer, left: 0, top: 0 },
          { input: backFile.buffer, left: meta1.width, top: 0 },
        ])
        .jpeg()
        .toBuffer();
    } else {
      finalBuffer = frontFile.buffer;
    }

    // Upload final merged (or single) image
    const uploadResult = await uploadToCloudinary(finalBuffer);
    const fileUrl = uploadResult.secure_url;

    // Save in DB
    const newFile = await File.create({
      fileUrl,
      degree,
      regulation,
      semester,
      branch,
      subject,
      examType,
      // paperSides,
      status: "pending",
    });

    // Email links
    const approveLink = `${backendUrl}/api/verify/${newFile._id}/approve`;
    const rejectLink = `${backendUrl}/api/verify/${newFile._id}/reject`;

    // Send email
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

    //     <p><a href="${fileUrl}" target="_blank">View Image</a></p>

    //     <p>
    //       <a href="${approveLink}" style="padding:10px 15px;background:#28a745;color:#fff;text-decoration:none;">Approve</a>
    //       &nbsp;
    //       <a href="${rejectLink}" style="padding:10px 15px;background:#dc3545;color:#fff;text-decoration:none;">Reject</a>
    //     </p>
    //   `,
    // });
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "New Paper Uploaded - Verification Required",
      html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; 
              border: 1px solid #e0e0e0; border-radius: 10px; background: #fafafa;">
    
    <h2 style="text-align: center; color: #333;">📄 New Exam Paper Uploaded</h2>

    <p style="font-size: 15px; color: #444;">
      A new exam paper has been uploaded and requires verification.
    </p>

    <div style="background: white; padding: 15px; border-radius: 8px; 
                border: 1px solid #ddd; margin-top: 15px;">
      <p style="margin: 6px 0;"><strong>Degree:</strong> ${degree}</p>
      <p style="margin: 6px 0;"><strong>Regulation:</strong> ${regulation}</p>
      <p style="margin: 6px 0;"><strong>Semester:</strong> ${semester}</p>
      <p style="margin: 6px 0;"><strong>Branch:</strong> ${branch}</p>
      <p style="margin: 6px 0;"><strong>Subject:</strong> ${subject}</p>
      <p style="margin: 6px 0;"><strong>Exam Type:</strong> ${examType}</p>
    </div>

    <div style="margin-top: 20px; text-align: center;">
      <a href="${fileUrl}"
         style="display: inline-block; margin-top: 10px; padding: 10px 20px;
                background: #007bff; color: white; text-decoration: none; 
                border-radius: 6px;">
        📎 View Uploaded Paper
      </a>
    </div>

    <div style="margin-top: 25px; text-align: center;">
      <a href="${approveLink}"
         style="padding: 10px 20px; background: #28a745; color: white;
                text-decoration: none; border-radius: 6px; margin-right: 10px;">
        ✅ Approve Paper
      </a>

      <a href="${rejectLink}"
         style="padding: 10px 20px; background: #dc3545; color: white;
                text-decoration: none; border-radius: 6px;">
        ❌ Reject Paper
      </a>
    </div>

    <p style="font-size: 13px; color: #777; text-align: center; margin-top: 25px;">
      This email was generated automatically. Please verify the paper for accuracy.
    </p>

  </div>
  `,
    });

    res.status(201).json({
      message: "Upload success. Pending review.",
      file: newFile,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
