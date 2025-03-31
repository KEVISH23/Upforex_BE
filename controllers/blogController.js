import { Blog } from "../models/index.js";
import {
  baseListQuery,
  blogSearchFields,
  blogsQuery,
} from "../queries/index.js";

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
    const { pageNum = 1, pageLimit = 10 } = req.query;
    const skip = (pageNum - 1) * pageLimit;
    // const blogs = await Blog.find().skip(skip).limit(pageLimit);
    const query = baseListQuery(blogsQuery, req.query, blogSearchFields, {
      search: true,
    });
    const totalDocs = await Blog.aggregate(query);
    const blogs = await Blog.aggregate(query)
      .skip(skip)
      .limit(Number(pageLimit));
    res.json({
      status: true,
      message: "Blogs fetched successfully!",
      data: blogs,
      metaData: {
        totalPage: totalDocs.length,
        pageNum: Number(pageNum),
        pageLimit: Number(pageLimit),
      },
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

export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.json({
        status: false,
        message: "Blog not found!",
        data: null,
      });
    }
    res.json({
      status: true,
      message: "Blog fetched successfully!",
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

export const deleteBlog = async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedBlog) {
      return res.json({
        status: false,
        message: "Blog not found!",
        data: null,
      });
    }
    res.json({
      status: true,
      message: "Blog deleted successfully!",
      data: deletedBlog,
    });
  } catch (error) {
    res.json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};
