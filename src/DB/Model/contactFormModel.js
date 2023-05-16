import mongoose from "mongoose";

const contactFormSchema = new mongoose.Schema(
  {
email:{
    type:String
},
name:{
    type:String
},
phone:{
    type:String
},
message:{
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

const ContactFormModel = mongoose.model("contactForm", contactFormSchema);

export default ContactFormModel;
