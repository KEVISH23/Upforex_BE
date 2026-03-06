import { AllowedIp } from "../models/index.js";
import { baseListQuery } from "../queries/index.js";


export const addAllowedIp = async (req, res) => {
  try {
    const { ipAddress, description } = req.body;

    if (!ipAddress || !description) {
      return res.status(400).json({
        status: false,
        message: "IP address and description are required",
        data: null,
      });
    }


    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipRegex.test(ipAddress)) {
      return res.status(400).json({
        status: false,
        message: "Invalid IP address format",
        data: null,
      });
    }


    const existingIp = await AllowedIp.findOne({ ipAddress });
    if (existingIp) {
      return res.status(400).json({
        status: false,
        message: "IP address already exists",
        data: null,
      });
    }

    const allowedIp = await AllowedIp.create({
      ipAddress,
      description,
      addedBy: req.admin._id,
    });

    await allowedIp.populate("addedBy", "name email");

    res.status(201).json({
      status: true,
      message: "IP address added successfully",
      data: allowedIp,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};


export const getAllowedIps = async (req, res) => {
  try {
    const { pageNum = 1, pageLimit = 10, showAll } = req.query;
    const skip = (pageNum - 1) * pageLimit;

    let query = [];
    if (!showAll) {
      query.push({ $match: { isActive: true } });
    }

    query = baseListQuery(query, req.query, ["ipAddress", "description"], {
      search: true,
    });

    const totalDocs = await AllowedIp.aggregate(query);
    const allowedIps = await AllowedIp.aggregate(query)
      .skip(skip)
      .limit(Number(pageLimit))
      .lookup({
        from: "admins",
        localField: "addedBy",
        foreignField: "_id",
        as: "addedBy",
      })
      .unwind("addedBy")
      .project({
        "addedBy.password": 0,
      })
      .sort({ isActive: -1, createdAt: -1 });

    res.json({
      status: true,
      message: "Allowed IPs fetched successfully",
      data: allowedIps,
      metaData: {
        totalPage: Math.ceil(totalDocs.length / pageLimit),
        totalDocs: totalDocs.length,
        pageNum: Number(pageNum),
        pageLimit: Number(pageLimit),
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};


export const getAllowedIpById = async (req, res) => {
  try {
    const allowedIp = await AllowedIp.findById(req.params.id).populate(
      "addedBy",
      "name email"
    );

    if (!allowedIp) {
      return res.status(404).json({
        status: false,
        message: "Allowed IP not found",
        data: null,
      });
    }

    res.json({
      status: true,
      message: "Allowed IP fetched successfully",
      data: allowedIp,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};


export const updateAllowedIp = async (req, res) => {
  try {
    const { description, isActive } = req.body;
    const updateData = {};

    if (description) updateData.description = description;
    if (typeof isActive === "boolean") updateData.isActive = isActive;

    const allowedIp = await AllowedIp.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("addedBy", "name email");

    if (!allowedIp) {
      return res.status(404).json({
        status: false,
        message: "Allowed IP not found",
        data: null,
      });
    }

    res.json({
      status: true,
      message: "Allowed IP updated successfully",
      data: allowedIp,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};


export const deleteAllowedIp = async (req, res) => {
  try {
    const allowedIp = await AllowedIp.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).populate("addedBy", "name email");

    if (!allowedIp) {
      return res.status(404).json({
        status: false,
        message: "Allowed IP not found",
        data: null,
      });
    }

    res.json({
      status: true,
      message: "Allowed IP deactivated successfully",
      data: allowedIp,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};


export const checkIpAllowed = async (req, res) => {
  try {
    const { ipAddress } = req.params;
    const isAllowed = await AllowedIp.isIpAllowed(ipAddress);

    res.json({
      status: true,
      message: isAllowed ? "IP address is allowed" : "IP address is not allowed",
      data: {
        ipAddress,
        isAllowed,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};
