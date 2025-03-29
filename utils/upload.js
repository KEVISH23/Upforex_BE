import multer from "multer";
import multerS3 from "multer-s3";
import s3 from "../s3Config.js";
import dotenv from "dotenv";
dotenv.config();
export const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const { type } = req.headers;
      const fileExtension = file.originalname.split(".").pop();
      const fileName = `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}.${fileExtension}`;
      cb(null, `uploads/${type}/${fileName}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/", "video/"];
    if (allowedTypes.some((type) => file.mimetype.startsWith(type))) {
      cb(null, true);
    } else {
      cb(new Error("Only images and videos are allowed!"));
    }
  },
});
