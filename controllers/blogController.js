import { Blog } from "../models/index.js";

export const createBlog = async (req, res) => {
  try {
    const blog = await Blog.create(req.body);
    if (!blog) throw new Error("Error in creating Blob");
    res.json({
      status: true,
      message: "Blog created successfully!",
      data: blog,
    });
  } catch (error) {
    res.json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    const [blogs] = await Blog.find();
    res.json({
      status: true,
      message: "Blogs fetched successfully!",
      data: blogs,
    });
  } catch (error) {
    res.json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body);

    if (!updatedBlog) {
      return res.json({
        status: false,
        message: "Blog not found!",
        data: null,
      });
    }

    res.json({
      status: true,
      message: "Blog updated successfully!",
      data: updatedBlog,
    });
  } catch (error) {
    res.json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};
