import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

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

// Lazy storage + multer — created on first request so env vars are loaded.
let _multer = null;
function getUpload() {
  if (!_multer) {
    ensureConfig();
    const storage = new CloudinaryStorage({
      cloudinary,
      params: {
        folder: "resumes",
        resource_type: "raw",
        public_id: (req, file) => {
          const timestamp = Date.now();
          const name = file.originalname.replace(/\.[^/.]+$/, "").replace(/\s+/g, "_");
          return `${name}_${timestamp}`;
        },
      },
    });
    _multer = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
  }
  return _multer;
}

// Proxy so callers can do `upload.single("resume")` unchanged.
const upload = new Proxy({}, {
  get(_, method) {
    return (...args) => getUpload()[method](...args);
  },
});

export { cloudinary, upload };
export default cloudinary;