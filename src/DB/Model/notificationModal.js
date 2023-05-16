import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
type:{
    type:String
},
title:{
    type:String
},
description:{
    type:String
},
link:{
    type:String
},
user:{
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "auth",
}

  },
  {
    timestamps: true,
  },
);

const NotificationModel = mongoose.model("notification", notificationSchema);

export default NotificationModel;
