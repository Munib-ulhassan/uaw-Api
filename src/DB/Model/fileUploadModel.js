import mongoose from "mongoose";

const fileUploadSchema = new mongoose.Schema(
  {
    file: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },   
    
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "auth",
    },
  },
  {
    timestamps: true,
  },
);

const fileUploadModel = mongoose.model("fileUpload", fileUploadSchema);

export default fileUploadModel;
