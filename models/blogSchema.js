import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    metaTitle: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    videoUrl: {
      type: String,
    },
    textField: {
      type: String,
      trim: true,
    },
    categories: {
      type: [mongoose.Types.ObjectId],
      ref: "Category",
    },
    imageAltTag: {
      type: String,
    },
    videoAltTag: {
      type: String,
    },
    tags: {
      type: [String],
    },
    permaLink: {
      type: String,
      unique: true,
    },
    featuredImage: {
      type: String,
    },
  },
  { timestamps: true }
);
const Blog = mongoose.model("Blog", blogSchema);
export { Blog };
