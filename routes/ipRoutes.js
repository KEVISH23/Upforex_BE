import express from "express";
import {
  addAllowedIp,
  getAllowedIps,
  getAllowedIpById,
  updateAllowedIp,
  deleteAllowedIp,
  checkIpAllowed,
} from "../controllers/index.js";
import { authMiddleware } from "../middlewares/index.js";

const ipRouter = express.Router();


ipRouter.get("/check/:ipAddress", checkIpAllowed);


ipRouter.use(authMiddleware);
ipRouter.post("/", addAllowedIp);
ipRouter.get("/", getAllowedIps);
ipRouter.get("/:id", getAllowedIpById);
ipRouter.put("/:id", updateAllowedIp);
ipRouter.delete("/:id", deleteAllowedIp);

export { ipRouter };
