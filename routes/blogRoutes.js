import express from "express";
import {
  createBlog,
  deleteBlog,
  getAllBlogs,
  getAllBlogsForWeb,
  getBlogById,
  getBlogByIdForWeb,
  getRecommendedBlogsForWeb,
  updateBlog,
} from "../controllers/index.js";
import { authMiddleware } from "../middlewares/index.js";

const blogRouter = express.Router();
blogRouter.get("/web/:id/recommended", getRecommendedBlogsForWeb);
blogRouter.get("/web/:id", getBlogByIdForWeb);
blogRouter.get("/web", getAllBlogsForWeb);

blogRouter.use(authMiddleware);
blogRouter.post("/", createBlog);
blogRouter.get("/", getAllBlogs);
blogRouter.put("/:id", updateBlog);
blogRouter.get("/:id", getBlogById);
blogRouter.delete("/:id", deleteBlog);

export { blogRouter };
