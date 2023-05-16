import authModel from "../DB/Model/authModel.js";
import DeviceModel from "../DB/Model/deviceModel.js";

export const linkUserDevice = async (authId, deviceToken, deviceType) => {
  // check if all arguments are provided and are of type string
  if (
    !authId ||
    !deviceToken ||
    !deviceType ||
    typeof deviceToken !== "string" ||
    typeof deviceType !== "string"
  ) {
    return { error: "Invalid arguments" };
  }
  // check if deviceToken is valid
  // if ( !deviceToken.match( /^[a-f0-9]{64}$/ ) )
  // {
  //   return { error: 'Invalid device token' };
  // }
  // check if device token is already linked to another user
  
  try {
    const existingDevice = await DeviceModel.findOne({
      deviceToken,
      user: { $ne: authId },
    });

    if (existingDevice) {
      
      // if device is already linked to another user, remove it from that user
      await authModel.findByIdAndUpdate(existingDevice.user, {
        $pull: { devices: existingDevice._id },
        $addToSet: { loggedOutDevices: existingDevice._id },
      });
    }
   
    const device = await DeviceModel.findOneAndUpdate(
      {
        deviceToken,
      },
      {
        $set: {
          deviceType,
          user: authId,
          $setOnInsert: { createdAt: new Date() },
          status: "active",
          lastSeen: new Date(),
          deviceToken,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );
    await authModel.findByIdAndUpdate(authId, {
      $addToSet: { devices: device._id },
      $pull: { loggedOutDevices: device._id },
    });
    return { device };
  } catch (e) {
    return { error: "Error while linking device" };
  }
};
