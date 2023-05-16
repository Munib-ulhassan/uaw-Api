import authModel from "../DB/Model/authModel.js";
import DesignationModel from "../DB/Model/designationModal.js";
import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import { hashPassword } from "../Utils/SecuringPassword.js";
import { sendEmails } from "../Utils/SendEmail.js";
import {
  IdValidator,
  RegisterUserValidator,
} from "../Utils/Validator/UserValidator.js";
import { designationValidator } from "../Utils/Validator/adminvalidator.js";
import { generateCode } from "../Utils/saltGen.js";

// const adminregister = async () => {
//   const AuthModel = new authModel();
//   AuthModel.email = "admin@admin.com";
//   AuthModel.password = hashPassword("123456");
//   AuthModel.userType = "admin";
//   AuthModel.name = "admin";
//   await AuthModel.save()
// };
// adminregister();
const registerUser = async (req, res, next) => {
  try {
    const { error } = RegisterUserValidator.validate(req.body);
    if (error) {
      return next(CustomError.badRequest(error.details[0].message));
    }
    const { email } = req.body;

    const IsUser = await authModel.findOne({ email });
    if (IsUser) {
      if (IsUser?.status == "pending") {
        return next(
          CustomError.createError("User Invited but not accpeted", 400)
        );
      }
      if (IsUser?.isDeleted == true) {
        return next(
          CustomError.createError(
            "User was exist in past now the account is deleted",
            400
          )
        );
      }
      return next(CustomError.createError("User Already Exists", 400));
    }

    const AuthModel = new authModel();

    AuthModel.email = email;

    await AuthModel.save();
    await sendEmails(
      email,
      `Wellcome to join UAW community`,
      `We wellcome you in our UAW community by joining using our app by this unique Id: ${email}`
    );

    return next(
      CustomSuccess.createSuccess(
        { uniqueId: email },
        "User Invitation sent successfully",
        200
      )
    );
  } catch (error) {
    next(CustomError.createError(error.message, 500));
  }
};
const adddesignation = async (req, res, next) => {
  try {
    const { error } = designationValidator.validate(req.body);
    if (error) {
      return next(CustomError.badRequest(error.details[0].message));
    }
    const { title } = req.body;
    const data = await DesignationModel.create({ title });
    return next(CustomSuccess.createSuccess(data, "Designation save", 200));
  } catch (error) {
    if (error.code == 11000) {
      return next(
        CustomError.createError("Duplicate Designation is not allowed", 500)
      );
    }

    return next(CustomError.createError(error.message, 500));
  }
};
const getdesignation = async (req, res, next) => {
  try {
    const { title } = req.query;
    if (title) {
      const data = await DesignationModel.aggregate([
        { $match: { title: title } },
        {
          $project: {
            title: 1, // Include the age field
            _id: 1, // Exclude _id from the output
          },
        },
        {
          $project: {
            field1: {
              $let: {
                vars: {
                  words: { $split: ["$title", " "] },
                },
                in: {
                  $concat: [
                    {
                      $toUpper: {
                        $substrCP: [{ $arrayElemAt: ["$$words", 0] }, 0, 1],
                      },
                    },
                    {
                      $substrCP: [
                        { $arrayElemAt: ["$$words", 0] },
                        1,
                        { $strLenCP: { $arrayElemAt: ["$$words", 0] } },
                      ],
                    },
                    {
                      $reduce: {
                        input: { $slice: ["$$words", 1, { $size: "$$words" }] },
                        initialValue: "",
                        in: {
                          $concat: [
                            "$$value",
                            " ",
                            {
                              $toUpper: {
                                $substrCP: [{ $toLower: "$$this" }, 0, 1],
                              },
                            },
                            {
                              $substrCP: [
                                { $toLower: "$$this" },
                                1,
                                { $strLenCP: { $toLower: "$$this" } },
                              ],
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      ]);
      if (data.length > 0) {
        return next(
          CustomSuccess.createSuccess(data, "Designation get Successfully", 200)
        );
      } else {
        return next(CustomError.badRequest("Designation Not available"));
      }
    } else {
      const data = await DesignationModel.aggregate([
        {
          $project: {
            title: 1, // Include the age field
            _id: 1, // Exclude _id from the output
          },
        },
        {
          $project: {
            field1: {
              $let: {
                vars: {
                  words: { $split: ["$title", " "] },
                },
                in: {
                  $concat: [
                    {
                      $toUpper: {
                        $substrCP: [{ $arrayElemAt: ["$$words", 0] }, 0, 1],
                      },
                    },
                    {
                      $substrCP: [
                        { $arrayElemAt: ["$$words", 0] },
                        1,
                        { $strLenCP: { $arrayElemAt: ["$$words", 0] } },
                      ],
                    },
                    {
                      $reduce: {
                        input: { $slice: ["$$words", 1, { $size: "$$words" }] },
                        initialValue: "",
                        in: {
                          $concat: [
                            "$$value",
                            " ",
                            {
                              $toUpper: {
                                $substrCP: [{ $toLower: "$$this" }, 0, 1],
                              },
                            },
                            {
                              $substrCP: [
                                { $toLower: "$$this" },
                                1,
                                { $strLenCP: { $toLower: "$$this" } },
                              ],
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      ]);
      if (data.length > 0) {
        return next(
          CustomSuccess.createSuccess(data, "Designation get Successfully", 200)
        );
      } else {
        return next(CustomError.badRequest("Designation Not available"));
      }
    }
  } catch (error) {
    next(CustomError.createError(error.message, 500));
  }
};
const updatedesignation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = IdValidator.validate(req.params);
    if (error) {
      return next(CustomError.badRequest(error.details[0].message));
    }
    const { title } = req.body;
    const updatedata = await DesignationModel.findByIdAndUpdate(
      id,
      { title: title.toLowerCase() },
      { new: true }
    );
    if (updatedata) {
      return next(
        CustomSuccess.createSuccess(
          updatedata,
          "Designation updated Successfully",
          200
        )
      );
    } else {
      return next(CustomError.badRequest("Designation Id is invalid"));
    }
  } catch (error) {
    if (error.code == 11000) {
      return next(
        CustomError.createError("Duplicate Designation is not allowed", 500)
      );
    }
    next(CustomError.createError(error.message, 500));
  }
};
const deletedesignation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = IdValidator.validate(req.params);
    if (error) {
      return next(CustomError.badRequest(error.details[0].message));
    }
    const { title } = req.body;
    const updatedata = await DesignationModel.findByIdAndDelete(
      id,

      { new: true }
    );
    if (updatedata) {
      return next(
        CustomSuccess.createSuccess(
          {},
          "Designation deleted Successfully",
          200
        )
      );
    } else {
      return next(CustomError.badRequest("Designation Id is invalid"));
    }
  } catch (error) {
    next(CustomError.createError(error.message, 500));
  }
};

const AdminController = {
  registerUser,
  adddesignation,
  getdesignation,
  updatedesignation,
  deletedesignation,
};

export default AdminController;
