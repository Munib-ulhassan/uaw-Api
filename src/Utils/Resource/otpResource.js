import moment from "moment";
import UserResource from "./UserResource.js";
class otpResource {
  constructor(User) {
    // this.Otp = Otp;
    this.User = {
      _id: User._id,
      email: User.identifier,
      createdAt: moment(User.createdAt).format("YYYY-MM-DD HH:mm:ss"),
    };
  }
  static BusinessWithToken(user, token) {
    const userResource = UserResource.Business(user);
    return {
      ...userResource,
      token,
    };
  }
  static WorkerWithToken(user, token) {
    const userResource = UserResource.Worker(user);
    return {
      ...userResource,
      token,
    };
  }
}

export default otpResource;
