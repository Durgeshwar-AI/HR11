import mongoose from "mongoose";

const formSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    resume: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    skills: {
      type: [String, String, String, String, String],
    },
  },
  { timestamps: true },
);

const Form = mongoose.model("Form", formSchema);

export default Form;
