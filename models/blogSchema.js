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
      trim: true,
    },
    textField: {
      type: String,
      trim: true,
    },
    categories: {
      type: [mongoose.Types.ObjectId],
      ref: "categories",
    },
    imageAltTag: {
      type: String,
    },
    videoAltTag: {
      type: String,
    },
  },
  { timestamps: true }
);
const Blog = mongoose.model("Blog", blogSchema);
export { Blog };
