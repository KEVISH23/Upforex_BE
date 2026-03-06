import { User, AllowedIp } from "../models/index.js";
import { baseListQuery } from "../queries/index.js";


const FIXED_TOKEN = "upf_live_9f8c4e7a2b6d1c5e8a9f3b7c2d4e6f1a";

const verifyFixedToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const clientIP =
    req.ip || req.connection.remoteAddress || req.headers["x-forwarded-for"];


  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      status: 0,
      message: "No valid authorization token provided",
      timestamp: new Date().toISOString(),
    });
  }

  const token = authHeader.split(" ")[1];


  if (token !== FIXED_TOKEN) {
    return res.status(401).json({
      success: false,
      status: 0,
      message: "Invalid authorization token",
      timestamp: new Date().toISOString(),
    });
  }


  const isIpAllowed = await AllowedIp.isIpAllowed(clientIP);
  if (!isIpAllowed) {
    return res.status(403).json({
      success: false,
      status: 0,
      message: "IP address not whitelisted",
      timestamp: new Date().toISOString(),
    });
  }

  next();
};


export const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      countryCode,
      phoneNo,
      countryId,
      affiliateCode,
      conditions,
      t_and_c,
      domain,
      role,
    } = req.body;


    const registrationIp =
      req.ip || req.connection.remoteAddress || req.headers["x-forwarded-for"];


    if (
      !firstName ||
      !lastName ||
      !email ||
      !countryCode ||
      !phoneNo ||
      !countryId ||
      !domain
    ) {
      return res.status(400).json({
        success: false,
        status: 0,
        message: "Missing required fields",
        timestamp: new Date().toISOString(),
      });
    }


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        status: 0,
        message: "Invalid email format",
        timestamp: new Date().toISOString(),
      });
    }

   
    if (conditions) {
      if (
        !t_and_c ||
        !t_and_c.accepted ||
        !t_and_c.acceptedAt ||
        !t_and_c.ipAddress ||
        !t_and_c.userAgent
      ) {
        return res.status(400).json({
          success: false,
          status: 0,
          message: "Terms and conditions acceptance data is incomplete",
          timestamp: new Date().toISOString(),
        });
      }

      
      if (
        !t_and_c.documents ||
        !Array.isArray(t_and_c.documents) ||
        t_and_c.documents.length === 0
      ) {
        return res.status(400).json({
          success: false,
          status: 0,
          message: "Legal documents information is required",
          timestamp: new Date().toISOString(),
        });
      }

      
      for (const doc of t_and_c.documents) {
        if (!doc.type || !doc.url || !doc.version) {
          return res.status(400).json({
            success: false,
            status: 0,
            message: "Each document must have type, url, and version",
            timestamp: new Date().toISOString(),
          });
        }
      }
    }


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        status: 0,
        message: "User with this email already exists",
        timestamp: new Date().toISOString(),
      });
    }

    
    const existingPhone = await User.findOne({ phoneNo });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        status: 0,
        message: "User with this phone number already exists",
        timestamp: new Date().toISOString(),
      });
    }


    const userData = {
      firstName,
      lastName,
      email,
      countryCode,
      phoneNo,
      countryId,
      affiliateCode: affiliateCode || "",
      conditions: !!conditions,
      domain,
      role: role || "user",
      registrationIp,
    };

  
    if (conditions && t_and_c) {
      userData.t_and_c = {
        accepted: t_and_c.accepted,
        acceptedAt: new Date(t_and_c.acceptedAt),
        ipAddress: t_and_c.ipAddress,
        userAgent: t_and_c.userAgent,
        documents: t_and_c.documents,
      };
    }

  
    const user = await User.create(userData);

    
    res.status(201).json({
      success: true,
      status: 1,
      message: "User data successfully",
      timestamp: new Date().toISOString(),
      data: {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("User registration error:", error);


    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        status: 0,
        message: "User with this email or phone number already exists",
        timestamp: new Date().toISOString(),
      });
    }

    res.status(500).json({
      success: false,
      status: 0,
      message: "Internal server error during registration",
      timestamp: new Date().toISOString(),
    });
  }
};


export const getAllUsers = async (req, res) => {
  try {
    const { pageNum = 1, pageLimit = 10 } = req.query;
    const skip = (pageNum - 1) * pageLimit;

    const query = baseListQuery(
      [],
      req.query,
      ["firstName", "lastName", "email"],
      {
        search: true,
      },
    );

    const totalDocs = await User.aggregate(query);
    const users = await User.aggregate(query)
      .skip(skip)
      .limit(Number(pageLimit))
      .project({
        password: 0, 
      });

    res.json({
      status: true,
      message: "Users fetched successfully",
      data: users,
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


export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
        data: null,
      });
    }

    res.json({
      status: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};


export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

   
    delete updateData.email;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
        data: null,
      });
    }

    res.json({
      status: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};


export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
        data: null,
      });
    }

    res.json({
      status: true,
      message: "User deactivated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};


export const getAllUsersPublic = async (req, res) => {
  try {
    const { pageNum = 1, pageLimit = 10 } = req.query;
    const skip = (pageNum - 1) * pageLimit;

    const query = baseListQuery(
      [{ $match: { isActive: true } }], 
      req.query,
      ["firstName", "lastName", "email"],
      { search: true },
    );

    const totalDocs = await User.aggregate(query);
    const users = await User.aggregate(query)
      .skip(skip)
      .limit(Number(pageLimit))
      .project({
        firstName: 1,
        lastName: 1,
        email: 1,
        countryCode: 1,
        phoneNo: 1,
        countryId: 1,
        domain: 1,
        role: 1,
        createdAt: 1,
        updatedAt: 1,
        isActive: 1,
      
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      status: 1,
      message: "Users fetched successfully",
      timestamp: new Date().toISOString(),
      data: users,
      metaData: {
        totalPage: Math.ceil(totalDocs.length / pageLimit),
        totalDocs: totalDocs.length,
        pageNum: Number(pageNum),
        pageLimit: Number(pageLimit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 0,
      message: "Internal server error while fetching users",
      timestamp: new Date().toISOString(),
    });
  }
};


export const getUserByIdPublic = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select({
      firstName: 1,
      lastName: 1,
      email: 1,
      countryCode: 1,
      phoneNo: 1,
      countryId: 1,
      affiliateCode: 1,
      conditions: 1,
      domain: 1,
      role: 1,
      isActive: 1,
      createdAt: 1,
      updatedAt: 1,
      
      "t_and_c.accepted": 1,
      "t_and_c.acceptedAt": 1,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        status: 0,
        message: "User not found",
        timestamp: new Date().toISOString(),
      });
    }

    if (!user.isActive) {
      return res.status(404).json({
        success: false,
        status: 0,
        message: "User account is deactivated",
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      status: 1,
      message: "User fetched successfully",
      timestamp: new Date().toISOString(),
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 0,
      message: "Internal server error while fetching user",
      timestamp: new Date().toISOString(),
    });
  }
};


export const getUserByEmailPublic = async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email, isActive: true }).select({
      firstName: 1,
      lastName: 1,
      email: 1,
      countryCode: 1,
      phoneNo: 1,
      countryId: 1,
      affiliateCode: 1,
      conditions: 1,
      domain: 1,
      role: 1,
      isActive: 1,
      createdAt: 1,
      updatedAt: 1,
      "t_and_c.accepted": 1,
      "t_and_c.acceptedAt": 1,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        status: 0,
        message: "User not found or account deactivated",
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      status: 1,
      message: "User fetched successfully",
      timestamp: new Date().toISOString(),
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 0,
      message: "Internal server error while fetching user",
      timestamp: new Date().toISOString(),
    });
  }
};


export { verifyFixedToken };
