import mongoose from "mongoose";
import { Blog } from "../models/index.js";
import {
  baseListQuery,
  blogSearchFields,
  blogsQuery,
} from "../queries/index.js";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../s3Config.js";

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
    // const blog = await Blog.findById(req.params.id);
    const [blog] = await Blog.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.id),
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
    if (deletedBlog.imageUrl) {
      const imageUrl = new DeleteObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: deletedBlog.imageUrl,
      });
      await s3.send(imageUrl);
    }
    if (deletedBlog.featuredImageUrl) {
      const featuredImageUrl = new DeleteObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: deletedBlog.featuredImageUrl,
      });
      await s3.send(featuredImageUrl);
    }

    if (deletedBlog.videoUrl) {
      const videoUrl = new DeleteObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: deletedBlog.videoUrl,
      });
      await s3.send(videoUrl);
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

export const getRecommendedBlogs = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

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
        $project: {
          title: 1,
          imageUrl: 1,
          videoUrl: 1,
        },
      },
    ]);

    const isEmpty = relatedBlogs.length === 0;

    res.json({
      status: true,
      message: isEmpty
        ? "No related blogs found!"
        : "Blog fetched successfully!",
      relatedBlogs,
      blog,
    });
  } catch (error) {
    res.json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};
