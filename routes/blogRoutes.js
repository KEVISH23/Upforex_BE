import express from "express";
import { createBlog, getAllBlogs, updateBlog } from "../controllers/index.js";
import { authMiddleware } from "../middlewares/index.js";

const blogRouter = express.Router();
blogRouter.use(authMiddleware);
blogRouter.post("/", createBlog);
blogRouter.get("/", getAllBlogs);
blogRouter.put("/:id", updateBlog);

export { blogRouter };
