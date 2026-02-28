import mongoose from "mongoose";

const HRUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    // WhatsApp phone in E.164 format e.g. "919876543210"
    whatsappPhone: { type: String, unique: true, sparse: true },
  },
  { timestamps: true },
);

const HRUser = mongoose.model("HRUser", HRUserSchema);
export default HRUser;
