import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      trim: true,
     
    },
    url: {
      type: String,
      required: true,
    },
    version: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const termsAndConditionsSchema = new mongoose.Schema(
  {
    accepted: {
      type: Boolean,
      required: true,
      default: false,
    },
    acceptedAt: {
      type: Date,
      required: function () {
        return this.accepted;
      },
    },
    ipAddress: {
      type: String,
      required: function () {
        return this.accepted;
      },
    },
    userAgent: {
      type: String,
      required: function () {
        return this.accepted;
      },
    },
    documents: [documentSchema],
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    countryCode: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNo: {
      type: String,
      required: true,
      trim: true,
    },
    countryId: {
      type: Number,
      required: true,
    },
    affiliateCode: {
      type: String,
      trim: true,
      default: "",
    },
    conditions: {
      type: Boolean,
      required: true,
      default: false,
    },
    t_and_c: {
      type: termsAndConditionsSchema,
      required: function () {
        return this.conditions;
      },
    },
    domain: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["user"],
      default: "user",
    },
    registrationIp: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);


userSchema.index({ phoneNo: 1 });


userSchema.index({ countryId: 1 });

const User = mongoose.model("User", userSchema);

export { User };
