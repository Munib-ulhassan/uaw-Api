import fs from "fs";
import bcrypt from "bcrypt";
import authModel from "../DB/Model/authModel.js";
import fileUploadModel from "../DB/Model/fileUploadModel.js";
import { handleMultipartData } from "../Utils/MultipartData.js";
import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import { comparePassword, hashPassword } from "../Utils/SecuringPassword.js";
import { sendEmails } from "../Utils/SendEmail.js";
import {
  LoginUserValidator,
  RegisterUserValidator,
  ResetPasswordValidator,
  changePasswordValidator,
  createprofilevalidator,
  forgetpasswordValidator,
  updatevalidator,
  verifyOTPValidator,
} from "../Utils/Validator/UserValidator.js";
import { linkUserDevice } from "../Utils/linkUserDevice.js";
import { tokenGen } from "../Utils/AccessTokenManagement/Tokens.js";
import OtpModel from "../DB/Model/otpModel.js";
import { genSalt } from "../Utils/saltGen.js";

const verifyuniqueid = async (req, res, next) => {
  try {
    const { error } = RegisterUserValidator.validate(req.body);
    if (error) {
      return next(CustomError.badRequest(error.details[0].message));
    }
    const AuthModel = await authModel.aggregate([
      {
        $match: { email: req.body.email, status: "pending" },
      },
    ]);

    if (AuthModel.length > 0) {
      return next(CustomSuccess.createSuccess({}, "Unique Id is Valid", 200));
    } else {
      return next(CustomError.badRequest("Unique Id is Invalid"));
    }
  } catch (error) {
    next(CustomError.createError(error.message, 500));
  }
};
//complete profile
const createProfile = async (req, res, next) => {
  try {
    const { error } = createprofilevalidator.validate(req.body);
    if (error) {
      return next(CustomError.badRequest(error.details[0].message));
    }
    const AuthModel = (await authModel.aggregate([
      {
        $match: { email: req.body.email, status: "pending" },
      },
      {
        $project:{
          devices:0,
          loggedOutDevices:0,
          otp:0,
          updatedAt:0,
          createdAt:0,
          _v:0
        }
      },
      { $limit: 1 },
    ]))[0];
    

    if (!AuthModel) {
      return next(CustomError.badRequest("User Not Found"));
    }

    const { file } = req;
    if (file) {
      // if (AuthModel.image?.file != null && AuthModel.image?.file != undefined) {
      //   fs.unlink("Uploads/" + AuthModel.image?.file, (err) => {
      //     if (err) {
      //     }
      //   });
      //   await fileUploadModel.deleteOne(AuthModel.image?._id);
      // }

      const FileUploadModel = await fileUploadModel.create({
        file: file.filename,
        fileType: file.mimetype,
        user: AuthModel._id,
      });

      req.body.image = FileUploadModel._id;
    }
    const { deviceToken, deviceType } = req.body;
    let data = Object.fromEntries(
      Object.entries(req.body).filter(([_, v]) => v != null)
    );
    data.status = "accepted";
    if (data.password) {
      data.password = hashPassword(data.password);
    }
    const device = await linkUserDevice(AuthModel._id, deviceToken, deviceType);
    if (device.error) {
      return next(CustomError.createError(device.error, 200));
    }
    const updateUser = await authModel.findByIdAndUpdate(
      AuthModel._id,

      data,
      {
        new: true,
      }
    );

    const token = await tokenGen(
      { id: updateUser._id, userType: updateUser.userType },
      "auth",
      deviceToken
    );

    return next(
      CustomSuccess.createSuccess(
        { ...AuthModel,...req.body, token },
        "User Profile Completed",
        200
      )
    );
  } catch (error) {
    if (error.code === 11000) {
      return next(CustomError.createError("Duplicate Username is not allowed", 200));
    }
    next(CustomError.createError(error.message, 500));
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { deviceToken } = req.headers;
    const { error } = updatevalidator.validate(req.body);
    if (error) {
      return next(CustomError.badRequest(error.details[0].message));
    }
    const { user, file } = req;

    if (!user) {
      return next(CustomError.badRequest("User Not Found"));
    }

    if (file) {
      if (user.image.file != null && user.image.file != undefined) {
        fs.unlink("Uploads/" + user.image.file, (err) => {
          if (err) {
          }
        });
        await fileUploadModel.deleteOne(user.image?._id);
      }
      const FileUploadModel = await fileUploadModel.create({
        file: file.filename,
        fileType: file.mimetype,
        user: user._id,
      });
      req.body.image = FileUploadModel._id;
    }
    let data = Object.fromEntries(
      Object.entries(req.body).filter(([_, v]) => v != null)
    );
    if (data.password) {
      data.password = hashPassword(data.password);
    }
    const updateUser = await authModel.findByIdAndUpdate(user._id, data, {
      new: true,
    });
    const token = await tokenGen(
      { id: updateUser._id, userType: updateUser.userType },
      "auth",
      deviceToken
    );

    return next(
      CustomSuccess.createSuccess(
        { ...updateUser._doc, token },
        "User Updated successfully",
        200
      )
    );
  } catch (error) {
    next(CustomError.createError(error.message, 500));
  }
};

const LoginUser = async (req, res, next) => {
  try {
    const { error } = LoginUserValidator.validate(req.body);
    if (error) {
      return next(CustomError.badRequest(error.details[0].message));
    }
    const { email, password, deviceType, deviceToken } = req.body;
    const AuthModel = await authModel.aggregate([
      { $match: { email: email, isDeleted: false, status: "accepted" } },
      {
        $lookup: {
          from: "fileUpload",
          localField: "image",
          foreignField: "_id",
          as: "image",
        },
      },
      {
        $limit: 1,
      },
    ]);

    if (!AuthModel[0]) {
      return next(CustomError.badRequest("User Not Found"));
    }

    const isPasswordValid = comparePassword(password, AuthModel[0].password);
    if (!isPasswordValid) {
      return next(CustomError.badRequest("Invalid Password"));
    }
    const device = await linkUserDevice(
      AuthModel[0]._id,
      deviceToken,
      deviceType
    );
    if (device.error) {
      return next(CustomError.createError(device.error, 200));
    }

    const token = await tokenGen(
      { id: AuthModel[0]._id, userType: AuthModel.userType },
      "auth",
      deviceToken
    );

    return next(
      CustomSuccess.createSuccess(
        { ...AuthModel[0]._doc, token },
        "User Logged In Successfull",
        200
      )
    );
  } catch (error) {
    next(CustomError.createError(error.message, 500));
  }
};

const getProfile = async (req, res, next) => {
  try {
    return next(
      CustomSuccess.createSuccess(
        req.user,
        "User Information get Successfull",
        200
      )
    );
  } catch (error) {
    next(CustomError.createError(error.message, 500));
  }
};

const forgetPassword = async (req, res, next) => {
  try {
    const { error } = forgetpasswordValidator.validate(req.body);
    if (error) {
      return next(CustomError.badRequest(error.details[0].message));
    }
    const { email } = req.body;

    const dataExist = await authModel.findOne({
      email: email,
      isDeleted: false,
    });

    if (!dataExist) {
      return next(CustomError.badRequest("User Not Found"));
    }
    let otp = Math.floor(Math.random() * 90000) + 100000;
    let otpExist = await OtpModel.findOne({ auth: dataExist._id });
    if (otpExist) {
      await OtpModel.findOneAndUpdate(
        { auth: dataExist._id },
        {
          otpKey: otp,
          reason: "forgetPassword",
          expireAt: new Date(new Date().getTime() + 60 * 60 * 1000),
        }
      );
    } else {
      otpExist = await OtpModel.create({
        auth: dataExist._id,
        otpKey: otp,
        reason: "forgetPassword",
        expireAt: new Date(new Date().getTime() + 60 * 60 * 1000),
      });
      await otpExist.save();
    }

    await authModel.findOneAndUpdate({ email }, { otp: otpExist._id });

    await sendEmails(
      email,
      "UAW - Account Verification",
      `
      <div
        style = "padding:20px 20px 40px 20px; position: relative; overflow: hidden; width: 100%;"
      >
        <img 
              style="
              top: 0;position: absolute;z-index: 0;width: 100%;height: 100vmax;object-fit: cover;" 
              src="cid:background" alt="background" 
        />
        <div style="z-index:1; position: relative;">
        <header style="padding-bottom: 20px">
          <div class="logo" style="text-align:center;">
            <img 
              style="width: 300px;" 
              src="cid:logo" alt="logo" />
          </div>
        </header>
        <main 
          style= "padding: 20px; background-color: #f5f5f5; border-radius: 10px; width: 80%; margin: 0 auto; margin-bottom: 20px; font-family: 'Poppins', sans-serif;"
        >
          <h1 
            style="color: #a87628; font-size: 30px; font-weight: 700;"
          >Welcome To UAW</h1>
          <p
            style="font-size: 24px; text-align: left; font-weight: 500; font-style: italic;"
          >Hi ${dataExist.name},</p>
          <p 
            style="font-size: 20px; text-align: left; font-weight: 500;"
          > Please use the following OTP to reset your password.</p>
          <h2
            style="font-size: 36px; font-weight: 700; padding: 10px; width:100%; text-align:center;color: #a87628; text-align: center; margin-top: 20px; margin-bottom: 20px;"
          >${otp}</h2>
          <p style = "font-size: 16px; font-style:italic; color: #343434">If you did not request this email, kindly ignore this. If this is a frequent occurence <a
          style = "color: #a87628; text-decoration: none; border-bottom: 1px solid #a87628;" href = "#"
          >let us know.</a></p>
          <p style = "font-size: 20px;">Regards,</p>
          <p style = "font-size: 20px;">Dev Team</p>
        </main>
        </div>
      <div>
      `
    );
    const token = await tokenGen(
      { id: dataExist._id, userType: dataExist.userType },
      "forgetPassword"
    );

    return next(
      CustomSuccess.createSuccess(
        { token, otp },
        "OTP for forgot password is sent to given email",
        200
      )
    );
  } catch (error) {
    next(CustomError.createError(error.message, 500));
  }
};

const VerifyOtp = async (req, res, next) => {
  try {
    console.log(req.user.tokenType);
    if (req.user.tokenType != "forgetPassword") {
      return next(
        CustomError.createError("Token type is not forgot password", 200)
      );
    }

    const { error } = verifyOTPValidator.validate(req.body);
    if (error) {
      error.details.map((err) => {
        next(CustomError.createError(err.message, 200));
      });
    }

    const { otp, deviceToken, deviceType } = req.body;
    const { email } = req.user;

    const user = await authModel.findOne({ email }).populate(["otp", "image"]);
    if (!user) {
      return next(CustomError.createError("User not found", 200));
    }
    const OTP = user.otp;
    if (!OTP || OTP.otpUsed) {
      return next(CustomError.createError("OTP not found", 200));
    }

    const userOTP = await bcrypt.hash(otp, genSalt);

    if (OTP.otpKey !== userOTP) {
      return next(CustomError.createError("Invalid OTP", 200));
    }

    const currentTime = new Date();
    const OTPTime = OTP.createdAt;
    const diff = currentTime.getTime() - OTPTime.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    if (minutes > 60) {
      return next(CustomError.createError("OTP expired", 200));
    }
    const device = await linkUserDevice(user._id, deviceToken, deviceType);
    if (device.error) {
      return next(CustomError.createError(device.error, 200));
    }
    const token = await tokenGen(user, "verify otp", deviceToken);

    const bulkOps = [];
    const update = { otpUsed: true };
    // let  userUpdate ;
    if (OTP._doc.reason !== "forgetPassword") {
      bulkOps.push({
        deleteOne: {
          filter: { _id: OTP._id },
        },
      });
      // userUpdate.OTP = null;
    } else {
      bulkOps.push({
        updateOne: {
          filter: { _id: OTP._id },
          update: { $set: update },
        },
      });
    }
    OtpModel.bulkWrite(bulkOps);
    // AuthModel.updateOne({ identifier: user.identifier }, { $set: userUpdate });
    // user.profile._doc.userType = user.userType;
    // const profile = { ...user.profile._doc, token };
    // delete profile.auth;

    return next(
      CustomSuccess.createSuccess(
        { ...user._doc, token },
        "OTP verified successfully",
        200
      )
    );
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      return next(CustomError.createError("otp not verify", 200));
    }
    return next(CustomError.createError(error.message, 200));
  }
};

const resetpassword = async (req, res, next) => {
  try {
    if (req.user.tokenType != "verify otp") {
      return next(
        CustomError.createError("First verify otp then reset password", 200)
      );
    }
    const { error } = ResetPasswordValidator.validate(req.body);

    if (error) {
      error.details.map((err) => {
        next(err.message, 200);
      });
    }

    // const { devicetoken } = req.headers;

    const { email } = req.user;
    // if (req.user.devices[req.user.devices.length - 1].deviceToken != devicetoken) {
    //   return next(CustomError.createError("Invalid device access", 200));
    // }

    const updateuser = await authModel.findOneAndUpdate(
      { email },
      {
        password: await bcrypt.hash(req.body.password, genSalt),
        otp: null,
      },
      { new: true }
    );

    // if (!updateuser) {
    //   return next(CustomError.createError("password not reset", 200));
    // }

    const user = await authModel.findOne({ email }).populate("image");
    const token = await tokenGen(user, "auth", req.body.deviceToken);

    const profile = { ...user._doc, token };
    delete profile.password;

    return next(
      CustomSuccess.createSuccess(profile, "password reset succesfully", 200)
    );
  } catch (error) {
    console.log(error, "/////");
    if (error.code === 11000) {
      return next(CustomError.createError("code not send", 200));
    }
    return next(CustomError.createError(error.message, 200));
  }
};

const AuthController = {
  verifyuniqueid,
  createProfile: [handleMultipartData.single("file"), createProfile],
  LoginUser,
  updateUser: [handleMultipartData.single("file"), updateUser],
  getProfile,
  // changePassword,
  forgetPassword,
  VerifyOtp,
  resetpassword,
};

export default AuthController;
