import express from "express";
import {
  createBlog,
  deleteBlog,
  getAllBlogs,
  getBlogById,
  getRecommendedBlogs,
  updateBlog,
} from "../controllers/index.js";
import { authMiddleware } from "../middlewares/index.js";

const blogRouter = express.Router();
blogRouter.post("/:id/recommended", getRecommendedBlogs);

blogRouter.use(authMiddleware);
blogRouter.post("/", createBlog);
blogRouter.get("/", getAllBlogs);
blogRouter.put("/:id", updateBlog);
blogRouter.get("/:id", getBlogById);
blogRouter.delete("/:id", deleteBlog);

export { blogRouter };
