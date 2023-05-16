import mongoose from "mongoose";
import { hashPassword } from "../../Utils/SecuringPassword.js";

const AuthSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: false,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
      required: false,
      unique: true,
    },
    code: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      required: false,
      default: "",
    },
    location: {
      type: String,
      trim: true,
      required: false,
      default: "",
    },
    image: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "fileUpload",
    },
    designation: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "designation",
    },
    userType: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
    },
    notificationOn: {
      type: Boolean,
      default: true,
    },
    devices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "device",
      },
    ],
    loggedOutDevices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "device",
      },
    ],
    myEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "content",
      },
    ],
    otp: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "otp",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
// AuthSchema.pre("update", function (next) {
//   // do something
//   console.log(this.isModified('password'));
//   if (!this.isModified('password')) return next();
//   this.password = hashPassword(this.password);

//   next(); //dont forget next();
// });
const authModel = mongoose.model("auth", AuthSchema);
export default authModel;
