import mongoose from "mongoose";

const userAcceptanceSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Can be email, user ID, or session ID
      required: true,
    },
    termsVersion: {
      type: String,
      required: true,
    },
    acceptedAt: {
      type: Date,
      default: Date.now,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    termsData: {
      type: mongoose.Types.ObjectId,
      ref: "Terms",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
userAcceptanceSchema.index({ userId: 1, termsVersion: 1 });
userAcceptanceSchema.index({ acceptedAt: -1 });

// Static method to get user's accepted terms
userAcceptanceSchema.statics.getUserAcceptedTerms = function (userId) {
  return this.findOne({ userId })
    .sort({ acceptedAt: -1 })
    .populate("termsData");
};

const UserAcceptance = mongoose.model("UserAcceptance", userAcceptanceSchema);

export { UserAcceptance };
