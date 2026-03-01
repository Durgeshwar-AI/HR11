import express from "express";
import { body, validationResult } from "express-validator";
import Form from "../../models/form.model.js";
import { upload, uploadToCloudinary } from "../../config/cloudinary.js";

const router = express.Router();

router.post(
  "/",
  upload.single("resume"), // field name from frontend
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("phone").notEmpty().withMessage("Phone number is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let resumeUrl = "";
      if (req.file) {
        const cloudResult = await uploadToCloudinary(req.file);
        resumeUrl = cloudResult.url;
      }

      const form = new Form({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        resume: resumeUrl,
      });

      await form.save();

      res.status(201).json(form);
    } catch (error) {
      res.status(500).json({ message: "Error saving form data", error });
    }
  }
);

export default router;