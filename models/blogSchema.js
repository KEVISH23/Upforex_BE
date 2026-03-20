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
    featuredImageUrl: {
      type: String,
    },
    customScripts: {
      type: [
        {
          scriptName: {
            type: String,
            trim: true,
            required: true,
          },
          scriptContent: {
            type: String,
            required: true,
          },
          scriptType: {
            type: String,
            enum: ["inline", "external", "json-ld"],
            default: "inline",
            description:
              "inline = JavaScript code | external = URL | json-ld = JSON object (string)",
          },
          isActive: {
            type: Boolean,
            default: true,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);
const Blog = mongoose.model("Blog", blogSchema);
export { Blog };
