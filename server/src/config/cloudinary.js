import cloudinaryModule from "cloudinary";
import multer from "multer";

const cloudinary = cloudinaryModule.v2;

// Lazy config — reads env vars on first use, safe against ESM import hoisting.
function ensureConfig() {
  if (!cloudinary.config().cloud_name) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
}

// Only allow PDF and DOCX
const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and DOCX files are allowed"), false);
  }
};

// Use memory storage — we upload to Cloudinary manually after multer parses the file.
// This avoids multer-storage-cloudinary version incompatibilities with multer v2.
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

/**
 * Upload a multer file (with .buffer) to Cloudinary.
 * Returns { url, publicId, originalName, mimeType }.
 */
function uploadToCloudinary(file) {
  ensureConfig();

  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const name = file.originalname
      .replace(/\.[^/.]+$/, "")
      .replace(/\s+/g, "_");

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "resumes",
        resource_type: "raw",
        public_id: `${name}_${timestamp}`,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          originalName: file.originalname,
          mimeType: file.mimetype,
        });
      },
    );

    stream.end(file.buffer);
  });
}

export { cloudinary, upload, uploadToCloudinary };
export default cloudinary;