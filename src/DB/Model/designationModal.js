import mongoose from "mongoose";

const designationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      unique: true,
      lowercase: true
    },
  },
  {
    timestamps: true,
  }
);
designationSchema.pre("save", function (next) {
  const doc = this;

  // Check uniqueness only if field1 is modified or newly added
  if (doc.isModified("title") || doc.isNew) {
    // Perform a query to check if a document with the same value exists
    mongoose
      .model("designation", designationSchema)
      .findOne({ title: doc.title }, function (err, existingDoc) {
        if (err) {
          return next(err);
        }

        // If a document with the same value exists, throw an error
        if (existingDoc) {
          const error = new Error("title value must be unique.");
          return next(error);
        }

        // If no document with the same value exists, proceed with saving the document
        next();
      });
  } else {
    // If field1 is not modified, proceed with saving the document
    next();
  }
});

const DesignationModel = mongoose.model("designation", designationSchema);

export default DesignationModel;
