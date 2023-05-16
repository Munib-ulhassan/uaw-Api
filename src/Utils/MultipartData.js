import multer from "multer";
import path from "path";
// import { dirname } from "./FilePath.js";
export const Storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join("Uploads"));
  },
  filename: (req, file, callback) => {
    const fileName = file.originalname.split(" ").join("-");
    const extension = path.extname(fileName);
    const baseName = path.basename(fileName, extension);
    callback(null, baseName + "-" + Date.now() + extension);
  },
});

export const handleMultipartData = multer({
  storage: Storage,
  limits: {
    fileSize: 1024 * 1024 * 100,
  },
  fileFilter: (req, file, callback) => {
    const FileTypes = /jpeg|jpg|png|gif/;
    const mimType = FileTypes.test(file.mimetype);
    const extname = FileTypes.test(path.extname(file.originalname));
    if (mimType && extname) {
      return callback(null, true);
    }
    callback(new Error("File type not supported"));
  },
});
