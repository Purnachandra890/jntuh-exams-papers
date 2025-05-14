const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'uploads', // Optional: creates a folder in Cloudinary
    allowed_formats: ['jpg', 'png', 'pdf'], // Allowed file types
    resource_type: 'auto' // auto-detect file type
  }
});

module.exports = {
  cloudinary,
  storage
};
