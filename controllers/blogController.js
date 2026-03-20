import mongoose from "mongoose";
import { Blog } from "../models/index.js";
import {
  baseListQuery,
  blogSearchFields,
  blogsQuery,
} from "../queries/index.js";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../s3Config.js";

// Helper function to generate script HTML for View Source visibility
const generateScriptHTML = (scripts) => {
  if (!scripts || !Array.isArray(scripts) || scripts.length === 0) {
    return "";
  }

  return scripts
    .filter((script) => script.isActive)
    .map((script, index) => {
      if (script.scriptType === "inline") {
        return `<script id="custom-script-inline-${index}" type="text/javascript">${script.scriptContent}</script>`;
      } else if (script.scriptType === "external") {
        const src = script.scriptContent.includes("src=")
          ? script.scriptContent.match(/src=["']([^"']+)["']/)?.[1]
          : script.scriptContent.trim();
        return `<script id="custom-script-external-${index}" type="text/javascript" src="${src}" async></script>`;
      } else if (script.scriptType === "json-ld") {
        return `<script id="custom-script-json-ld-${index}" type="application/ld+json">${script.scriptContent}</script>`;
      }
      return "";
    })
    .filter((html) => html)
    .join("\n");
};

// Validate and clean custom scripts
const validateCustomScripts = (scripts) => {
  if (!scripts || !Array.isArray(scripts)) {
    return [];
  }

  return scripts.map((script) => ({
    scriptName: String(script.scriptName || "").trim(),
    scriptContent: String(script.scriptContent || "").trim(),
    scriptType: ["inline", "external", "json-ld"].includes(script.scriptType)
      ? script.scriptType
      : "inline",
    isActive: Boolean(script.isActive),
  }));
};

export const createBlog = async (req, res) => {
  try {
    // Validate and clean custom scripts
    if (req.body.customScripts) {
      req.body.customScripts = validateCustomScripts(req.body.customScripts);
    }

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
    // Validate and clean custom scripts
    if (req.body.customScripts) {
      req.body.customScripts = validateCustomScripts(req.body.customScripts);
    }

    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

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

    // Generate script HTML for View Source visibility
    const scriptHTML = generateScriptHTML(blog.customScripts);

    res.json({
      status: true,
      message: "Blog fetched successfully!",
      data: blog,
      scriptHTML: scriptHTML, // For SSR or direct HTML injection
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
