import mongoose from "mongoose";

const HRUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

const HRUser = mongoose.model("HRUser", HRUserSchema);
export default HRUser;
