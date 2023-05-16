import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "auth",
    },
   
    deviceType: {
      type: String,
      enum:["android","postman","mac"],
      default: null,
    },
    deviceMAC: {
      type: String,
      default: null,
    },
    deviceToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const DeviceModel = mongoose.model("device", DeviceSchema);

export default DeviceModel;
