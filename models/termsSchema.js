import mongoose from "mongoose";

const termsSchema = new mongoose.Schema(
  {
    version: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false, // Only one version can be active at a time
    },
    effectiveDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
    modifiedBy: {
      type: mongoose.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to update lastModified
termsSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.lastModified = new Date();
  }
  next();
});

// Static method to get active terms
termsSchema.statics.getActiveTerms = function () {
  return this.findOne({ isActive: true }).populate("modifiedBy", "name email");
};

// Method to generate URL slug
termsSchema.methods.generateUrl = function () {
  return `/terms/${this.version}`;
};

const Terms = mongoose.model("Terms", termsSchema);

export { Terms };
