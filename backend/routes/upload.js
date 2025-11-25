const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const sharp = require("sharp");
const sendEmail = require("../utils/sendEmail");
const File = require("../models/File");

const backendUrl1 = process.env.BACKEND_URL_1;
const backendUrl2 = process.env.BACKEND_URL_2;

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

    // original image sizes
    // console.log(
    //   "Front image original size:",
    //   (frontFile.size / 1024 / 1024).toFixed(2),
    //   "MB"
    // );

    if (backFile) {
      console.log(
        "Back image original size:",
        (backFile.size / 1024 / 1024).toFixed(2),
        "MB"
      );
    }

    if (!frontFile) {
      return res.status(400).json({ message: "Front image is required" });
    }

    let finalBuffer;

    if (paperSides === "two") {
      const img1 = sharp(frontFile.buffer);
      const img2 = sharp(backFile.buffer);

      const meta1 = await img1.metadata();
      const meta2 = await img2.metadata();

      // Merge into horizontal image
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

      // console.log(
      //   "Merged image size (before compression):",
      //   (finalBuffer.length / 1024 / 1024).toFixed(2),
      //   "MB"
      // );

      // 🔥 Compress merged image
      finalBuffer = await sharp(finalBuffer)
        .resize({ width: 2000 }) // resize merged output
        .jpeg({ quality: 75 }) // reduce size
        .toBuffer();
      // console.log(
      //   "Final image size (after compression):",
      //   (finalBuffer.length / 1024).toFixed(2),
      //   "KB"
      // );
    } else {
      // ONE-SIDE PAPER
      finalBuffer = await sharp(frontFile.buffer)
        .resize({ width: 1500 }) // resize for readability
        .jpeg({ quality: 70 }) // compress
        .toBuffer();
      // console.log(
      //   "Final image size (after compression):",
      //   (finalBuffer.length / 1024).toFixed(2),
      //   "KB"
      // );
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
    const approveLink1 = `${backendUrl1}/api/verify/${newFile._id}/approve`;
    const rejectLink1 = `${backendUrl1}/api/verify/${newFile._id}/reject`;

    const approveLink2 = `${backendUrl2}/api/verify/${newFile._id}/approve`;
    const rejectLink2 = `${backendUrl2}/api/verify/${newFile._id}/reject`;

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "New Paper Uploaded - Verification Required",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background: #fafafa;"> 
        <h2 style="text-align: center; color: #333;">📄 New Exam Paper Uploaded</h2> 
        <p style="font-size: 15px; color: #444;"> A new exam paper has been uploaded and requires verification. </p> 
        <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd; margin-top: 15px;"> 
          <p style="margin: 6px 0;"><strong>Degree:</strong> ${degree}</p> 
          <p style="margin: 6px 0;"><strong>Regulation:</strong> ${regulation}</p> 
          <p style="margin: 6px 0;"><strong>Semester:</strong> ${semester}</p> 
          <p style="margin: 6px 0;"><strong>Branch:</strong> ${branch}</p> 
          <p style="margin: 6px 0;"><strong>Subject:</strong> ${subject}</p> 
          <p style="margin: 6px 0;"><strong>Exam Type:</strong> ${examType}</p> 
      </div>
      <div style="margin-top: 25px; text-align: center;">
          <p><strong>✅ Approve:</strong></p>
          <a href="${approveLink1}"
            style="padding: 10px 18px; background: #28a745; color: white;
                    text-decoration: none; border-radius: 6px; margin-right: 10px;">
            Approve (Server 1)
          </a>
          <a href="${approveLink2}"
            style="padding: 10px 18px; background: #198754; color: white;
                    text-decoration: none; border-radius: 6px;">
            Approve (Server 2)
          </a>
      </div>

        <div style="margin-top: 20px; text-align: center;">
            <p><strong>❌ Reject:</strong></p>
            <a href="${rejectLink1}"
              style="padding: 10px 18px; background: #dc3545; color: white;
                      text-decoration: none; border-radius: 6px; margin-right: 10px;">
              Reject (Server 1)
            </a>
            <a href="${rejectLink2}"
              style="padding: 10px 18px; background: #bb2d3b; color: white;
                      text-decoration: none; border-radius: 6px;">
              Reject (Server 2)
            </a>
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
