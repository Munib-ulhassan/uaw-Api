import authModel from "../../DB/Model/authModel.js";
import { joseJwtDecrypt } from "../../Utils/AccessTokenManagement/Tokens.js";
import CustomError from "../../Utils/ResponseHandler/CustomError.js";
export const AuthMiddleware = async (req, res, next) => {
  const AuthHeader =
    req.headers.authorization ||
    req.body.token ||
    req.query.token ||
    req.headers["x-access-token"];
  if (!AuthHeader) {
    return next(CustomError.unauthorized());
  }
  const parts = AuthHeader.split(" ");
  try {
    if (parts.length !== 2) {
      return next(CustomError.unauthorized());
    }

    const [scheme, token] = parts;
    // token

    if (!/^Bearer$/i.test(scheme)) {
      return next(CustomError.unauthorized());
    }

    const UserToken = await joseJwtDecrypt(token);
    
    const UserDetail = await authModel
      .findOne({ _id: UserToken.payload.uid })
      .populate("image");

    if (!UserDetail) {
      return next(CustomError.unauthorized());
    }
    UserDetail.tokenType = UserToken.payload.tokenType;
    req.user = UserDetail;
    return next();
  } catch (error) {
    return next(CustomError.unauthorized());
  }
};

export const AdminMiddleware = async (req, res, next) => {
  const AuthHeader =
    req.headers.authorization ||
    req.body.token ||
    req.query.token ||
    req.headers["x-access-token"];
  if (!AuthHeader) {
    return next(CustomError.unauthorized());
  }
  const parts = AuthHeader.split(" ");
  try {
    if (parts.length !== 2) {
      return next(CustomError.unauthorized());
    }

    const [scheme, token] = parts;
    // token

    if (!/^Bearer$/i.test(scheme)) {
      return next(CustomError.unauthorized());
    }

    const UserToken = await joseJwtDecrypt(token);

    const UserDetail = await authModel
      .findOne({ _id: UserToken.payload.uid })
      .populate("image");

    if (!UserDetail && UserDetail.userType == "admin") {
      return next(CustomError.unauthorized());
    }
    console.log(UserToken);

    req.user = UserDetail;
    return next();
  } catch (error) {
    return next(CustomError.unauthorized());
  }
};
