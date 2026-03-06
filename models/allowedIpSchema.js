import mongoose from "mongoose";

const allowedIpSchema = new mongoose.Schema(
  {
    ipAddress: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    addedBy: {
      type: mongoose.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    lastUsed: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


allowedIpSchema.index({ ipAddress: 1, isActive: 1 });


allowedIpSchema.statics.isIpAllowed = async function(ipAddress) {
  const allowedIp = await this.findOne({ 
    ipAddress: ipAddress, 
    isActive: true 
  });
  
  if (allowedIp) {
    
    allowedIp.lastUsed = new Date();
    await allowedIp.save();
    return true;
  }
  
  return false;
};


allowedIpSchema.statics.getActiveIps = function() {
  return this.find({ isActive: true }).populate("addedBy", "name email");
};

const AllowedIp = mongoose.model("AllowedIp", allowedIpSchema);

export { AllowedIp };
