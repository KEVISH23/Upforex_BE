import mongoose from "mongoose";
import { Blog } from "../models/index.js";
import {
  baseListQuery,
  blogSearchFields,
  blogsQuery,
} from "../queries/index.js";

export const getAllBlogsForWeb = async (req, res) => {
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

export const getBlogByIdForWeb = async (req, res) => {
  try {
    const [blog] = await Blog.aggregate([
      {
        $match: {
          permaLink: req.params.id,
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categories",
          foreignField: "_id",
          as: "categories",
        },
      },
    ]);
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

export const getRecommendedBlogsForWeb = async (req, res) => {
  try {
    const blog = await Blog.findOne({ permaLink: req.params.id });

    const relatedBlogs = await Blog.aggregate([
      {
        $match: {
          _id: { $ne: blog._id },
          $or: [
            {
              categories: {
                $in: blog.categories,
              },
            },
            {
              tags: { $in: blog.tags },
            },
          ],
        },
      },
      {
        $limit: 6,
      },
      {
        $project: {
          title: 1,
          description: 1,
          permaLink: 1,
        },
      },
    ]);

    const isEmpty = relatedBlogs.length === 0;

    res.json({
      status: true,
      message: isEmpty
        ? "No related blogs found!"
        : "Blog fetched successfully!",
      data: relatedBlogs,
    });
  } catch (error) {
    res.json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};
