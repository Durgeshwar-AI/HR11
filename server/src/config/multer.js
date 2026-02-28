import multer from "multer";
import cloudinaryStorage from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const storage = cloudinaryStorage({
  cloudinary,
  params: {
    folder: "resumes",
    resource_type: "raw", // important for pdf/doc files
  },
});

const upload = multer({ storage });

export default upload;