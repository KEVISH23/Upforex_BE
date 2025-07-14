import { Terms, UserAcceptance } from "../models/index.js";
import { baseListQuery } from "../queries/index.js";

// Get all terms (admin)
export const getAllTerms = async (req, res) => {
  try {
    const { pageNum = 1, pageLimit = 10 } = req.query;
    const skip = (pageNum - 1) * pageLimit;

    const query = baseListQuery([], req.query, ["version", "title"], {
      search: true,
    });

    const totalDocs = await Terms.aggregate(query);
    const terms = await Terms.aggregate(query)
      .skip(skip)
      .limit(Number(pageLimit))
      .lookup({
        from: "admins",
        localField: "modifiedBy",
        foreignField: "_id",
        as: "modifiedBy",
      })
      .unwind("modifiedBy")
      .project({
        "modifiedBy.password": 0,
      })
      .sort({ isActive: -1, lastModified: -1 }); // Active first, then by lastModified

    res.json({
      status: true,
      message: "Terms fetched successfully.",
      data: terms,
      metaData: {
        totalPage: Math.ceil(totalDocs.length / pageLimit),
        totalDocs: totalDocs.length,
        pageNum: Number(pageNum),
        pageLimit: Number(pageLimit),
      },
    });
  } catch (error) {
    res.json({ status: false, message: error.message, data: null });
  }
};

// Create new terms version
export const createTerms = async (req, res) => {
  try {
    console.log('req.admin:', req.admin); // Debug log
    console.log('req.user:', req.user); // Debug log
    
    const { version, title, content, isActive = false } = req.body;
    
    if (!req.admin || !req.admin._id) {
      return res.status(400).json({
        status: false,
        message: "Admin authentication failed",
        data: null,
      });
    }
    
    const modifiedBy = req.admin._id; // From auth middleware

    // Validate version format (v[major].[minor] where minor is 0-9)
    const versionPattern = /^v\d+\.[0-9]$/;
    if (!versionPattern.test(version)) {
      return res.json({
        status: false,
        message:
          "Version format should be v[major].[minor] where minor is 0-9 (e.g., v1.0, v1.5, v2.0)",
        data: null,
      });
    }

    // Check if version already exists
    const existingTerms = await Terms.findOne({ version });
    if (existingTerms) {
      return res.json({
        status: false,
        message: "Terms with this version already exists.",
        data: null,
      });
    }

    // If setting as active, deactivate all other versions
    if (isActive) {
      await Terms.updateMany({}, { isActive: false });
    }

    const terms = await Terms.create({
      version,
      title,
      content,
      isActive,
      modifiedBy,
    });

    await terms.populate("modifiedBy", "name email");

    res.json({
      status: true,
      message: "Terms created successfully!",
      data: {
        ...terms.toObject(),
        url: terms.generateUrl(),
      },
    });
  } catch (error) {
    res.json({ status: false, message: error.message, data: null });
  }
};

// Get terms by ID
export const getTermsById = async (req, res) => {
  try {
    const terms = await Terms.findById(req.params.id).populate(
      "modifiedBy",
      "name email"
    );
    if (!terms) {
      return res.json({
        status: false,
        message: "Terms not found.",
        data: null,
      });
    }

    res.json({
      status: true,
      message: "Terms fetched successfully.",
      data: {
        ...terms.toObject(),
        url: terms.generateUrl(),
      },
    });
  } catch (error) {
    res.json({ status: false, message: error.message, data: null });
  }
};

// Update terms (only content and title can be updated)
export const updateTerms = async (req, res) => {
  try {
    const { title, content, isActive } = req.body;
    const modifiedBy = req.admin._id;

    const terms = await Terms.findById(req.params.id);
    if (!terms) {
      return res.json({
        status: false,
        message: "Terms not found.",
        data: null,
      });
    }

    // If setting as active, deactivate all other versions
    if (isActive && !terms.isActive) {
      await Terms.updateMany({}, { isActive: false });
    }

    // Update fields
    if (title) terms.title = title;
    if (content) terms.content = content;
    if (typeof isActive === "boolean") terms.isActive = isActive;
    terms.modifiedBy = modifiedBy;

    await terms.save();
    await terms.populate("modifiedBy", "name email");

    res.json({
      status: true,
      message: "Terms updated successfully!",
      data: {
        ...terms.toObject(),
        url: terms.generateUrl(),
      },
    });
  } catch (error) {
    res.json({ status: false, message: error.message, data: null });
  }
};

// Get active terms (public)
export const getActiveTerms = async (req, res) => {
  try {
    const terms = await Terms.getActiveTerms();
    if (!terms) {
      return res.json({
        status: false,
        message: "No active terms found.",
        data: null,
      });
    }

    res.json({
      status: true,
      message: "Active terms fetched successfully.",
      data: {
        ...terms.toObject(),
        url: terms.generateUrl(),
      },
    });
  } catch (error) {
    res.json({ status: false, message: error.message, data: null });
  }
};

// Get terms by version (public)
export const getTermsByVersion = async (req, res) => {
  try {
    const { version } = req.params;
    const terms = await Terms.findOne({ version }).populate(
      "modifiedBy",
      "name email"
    );

    if (!terms) {
      return res.json({
        status: false,
        message: "Terms version not found.",
        data: null,
      });
    }

    res.json({
      status: true,
      message: "Terms fetched successfully.",
      data: {
        ...terms.toObject(),
        url: terms.generateUrl(),
      },
    });
  } catch (error) {
    res.json({ status: false, message: error.message, data: null });
  }
};

// Get all versions list (public)
export const getAllVersions = async (req, res) => {
  try {
    const versions = await Terms.find(
      {},
      "version title effectiveDate isActive"
    ).sort({ createdAt: -1 });

    res.json({
      status: true,
      message: "Terms versions fetched successfully.",
      data: versions.map((term) => ({
        ...term.toObject(),
        url: term.generateUrl(),
      })),
    });
  } catch (error) {
    res.json({ status: false, message: error.message, data: null });
  }
};

// Record user acceptance
export const acceptTerms = async (req, res) => {
  try {
    const { userId, termsVersion } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get("User-Agent");

    // Find the terms by version
    const terms = await Terms.findOne({ version: termsVersion });
    if (!terms) {
      return res.json({
        status: false,
        message: "Terms version not found.",
        data: null,
      });
    }

    // Record acceptance
    const acceptance = await UserAcceptance.create({
      userId,
      termsVersion,
      ipAddress,
      userAgent,
      termsData: terms._id,
    });

    await acceptance.populate("termsData");

    res.json({
      status: true,
      message: "Terms acceptance recorded successfully!",
      data: {
        acceptanceId: acceptance._id,
        userId: acceptance.userId,
        termsVersion: acceptance.termsVersion,
        acceptedAt: acceptance.acceptedAt,
        termsUrl: terms.generateUrl(),
      },
    });
  } catch (error) {
    res.json({ status: false, message: error.message, data: null });
  }
};

// Get user's accepted terms
export const getUserAcceptedTerms = async (req, res) => {
  try {
    const { userId } = req.params;

    const acceptance = await UserAcceptance.getUserAcceptedTerms(userId);
    if (!acceptance) {
      return res.json({
        status: false,
        message: "No terms acceptance found for this user.",
        data: null,
      });
    }

    res.json({
      status: true,
      message: "User accepted terms fetched successfully.",
      data: {
        acceptanceId: acceptance._id,
        userId: acceptance.userId,
        termsVersion: acceptance.termsVersion,
        acceptedAt: acceptance.acceptedAt,
        terms: acceptance.termsData,
        termsUrl: acceptance.termsData.generateUrl(),
      },
    });
  } catch (error) {
    res.json({ status: false, message: error.message, data: null });
  }
};

// Set active version
export const setActiveVersion = async (req, res) => {
  try {
    const terms = await Terms.findById(req.params.id);
    if (!terms) {
      return res.json({
        status: false,
        message: "Terms not found.",
        data: null,
      });
    }

    // Deactivate all other versions
    await Terms.updateMany({}, { isActive: false });

    // Set this version as active
    terms.isActive = true;
    terms.modifiedBy = req.admin._id;
    await terms.save();

    await terms.populate("modifiedBy", "name email");

    res.json({
      status: true,
      message: "Version set as active successfully!",
      data: terms,
    });
  } catch (error) {
    res.json({ status: false, message: error.message, data: null });
  }
};
