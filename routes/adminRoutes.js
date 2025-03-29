import express from "express";
import {
  createAdmin,
  deleteAdmin,
  getAdminById,
  getAllAdmins,
  login,
  updateAdmin,
} from "../controllers/index.js";
import { authMiddleware } from "../middlewares/index.js";
const adminRouter = express.Router();

adminRouter.post("/login", login);
adminRouter.use(authMiddleware);

adminRouter.post("/", createAdmin);
adminRouter.get("/", getAllAdmins);
adminRouter.get("/:id", getAdminById);
adminRouter.put("/:id", updateAdmin);
adminRouter.delete("/:id", deleteAdmin);

export { adminRouter };
