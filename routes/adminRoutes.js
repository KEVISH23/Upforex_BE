import express from "express";
import {
  createAdmin,
  deleteAdmin,
  deleteFile,
  getAdminById,
  getAllAdmins,
  login,
  updateAdmin,
} from "../controllers/index.js";
import { authMiddleware } from "../middlewares/index.js";
import { upload } from "../utils/index.js";

const adminRouter = express.Router();

adminRouter.post("/login", login);
adminRouter.use(authMiddleware);

adminRouter.post("/", createAdmin);
adminRouter.get("/", getAllAdmins);
adminRouter.get("/:id", getAdminById);
adminRouter.put("/:id", updateAdmin);
adminRouter.delete("/:id", deleteAdmin);
adminRouter.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ status: false, message: "No file uploaded." });
  }

  res.json({
    status: true,
    message: "File uploaded successfully!",
    data: {
      fileUrl: req.file.location,
      fileName: req.file.key,
    },
  });
});
adminRouter.post("/delete-file", deleteFile);
export { adminRouter };
