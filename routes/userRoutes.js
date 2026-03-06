import express from "express";
import {
  registerUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsersPublic,
  getUserByIdPublic,
  getUserByEmailPublic,
  verifyFixedToken,
} from "../controllers/index.js";
import { authMiddleware } from "../middlewares/index.js";

const userRouter = express.Router();


userRouter.post("/", verifyFixedToken, registerUser);
// userRouter.get("/public", verifyFixedToken, getAllUsersPublic);
// userRouter.get("/public/id/:id", verifyFixedToken, getUserByIdPublic);
userRouter.get("/public/email/:email", verifyFixedToken, getUserByEmailPublic);


userRouter.use(authMiddleware);
userRouter.get("/", getAllUsers);
userRouter.get("/:id", getUserById);
userRouter.put("/:id", updateUser);
userRouter.delete("/:id", deleteUser);

export { userRouter };
