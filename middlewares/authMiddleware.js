import { Admin } from "../models/index.js";
import { verifyToken } from "../utils/index.js";

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      status: false,
      message: "No token provided.",
      data: null,
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      status: false,
      message: "Invalid token format.",
      data: null,
    });
  }

  try {
    const decoded = verifyToken(token);
    console.log("Decoded token:", decoded); // Debug log
    const admin = await Admin.findById(decoded.id);
    console.log("Found admin:", admin ? "Yes" : "No"); // Debug log

    if (!admin) {
      return res.status(401).json({
        status: false,
        message: "Invalid Token",
        data: null,
      });
    }
    req.user = decoded;
    req.admin = admin;
    console.log("Admin set in req:", !!req.admin); // Debug log
    next();
  } catch (error) {
    res.status(401).json({
      status: false,
      message: "Invalid or expired token.",
      data: null,
    });
  }
};
