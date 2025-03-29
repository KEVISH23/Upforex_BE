import { Admin } from "../models/index.js";
import { generateToken } from "../utils/index.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        status: false,
        message: "Email and password are required.",
        data: null,
      });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.json({
        status: false,
        message: "Invalid email or password.",
        data: null,
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.json({
        status: false,
        message: "Invalid email or password.",
        data: null,
      });
    }
    const token = generateToken({ email: admin.email, id: admin._id });

    res.json({
      status: true,
      message: "Login successful!",
      data: {
        token,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.json({ status: false, message: "Internal server error.", data: null });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin)
      return res.json({
        status: false,
        message: "Admin already exists.",
        data: null,
      });

    const admin = await Admin.create({ email, password });
    res.json({
      status: true,
      message: "Admin created successfully!",
      data: admin,
    });
  } catch (error) {
    res.json({ status: false, message: error.message, data: null });
  }
};

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.json({
      status: true,
      message: "Admins fetched successfully.",
      data: admins,
    });
  } catch (error) {
    res.json({ status: false, message: error.message, data: null });
  }
};

export const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin)
      return res.json({
        status: false,
        message: "Admin not found.",
        data: null,
      });
    res.json({
      status: true,
      message: "Admin fetched successfully.",
      data: admin,
    });
  } catch (error) {
    res.json({ status: false, message: error.message, data: null });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedAdmin)
      return res.json({
        status: false,
        message: "Admin not found.",
        data: null,
      });
    res.json({
      status: true,
      message: "Admin updated successfully.",
      data: updatedAdmin,
    });
  } catch (error) {
    res.json({ status: false, message: error.message, data: null });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const deletedAdmin = await Admin.findByIdAndDelete(req.params.id);
    if (!deletedAdmin)
      return res.json({
        status: false,
        message: "Admin not found.",
        data: null,
      });
    res.json({
      status: true,
      message: "Admin deleted successfully.",
      data: deletedAdmin,
    });
  } catch (error) {
    res.json({ status: false, message: error.message, data: null });
  }
};
