import { Admin } from "../models/index.js";
import { generateToken } from "../utils/index.js";
import { baseListQuery } from "../queries/index.js";
import s3 from "../s3Config.js";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import bcrypt from "bcrypt";
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
        name: admin.name,
        id: admin._id,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.json({ status: false, message: "Internal server error.", data: null });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin)
      return res.json({
        status: false,
        message: "Admin already exists.",
        data: null,
      });

    const admin = await Admin.create({ email, password, name });
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
    const { pageNum, pageLimit } = req.query;
    const skip = (pageNum - 1) * pageLimit;
    const query = baseListQuery([], req.query, ["email", "name"], {
      search: true,
    });
    const totalDocs = await Admin.aggregate(query);
    const admins = await Admin.aggregate(query)
      .skip(skip)
      .limit(Number(pageLimit));
    res.json({
      status: true,
      message: "Admins fetched successfully.",
      data: admins,
      metaData: {
        totalPage: Math.ceil(totalDocs.length / Number(pageLimit)),
        pageNum: Number(pageNum),
        pageLimit: Number(pageLimit),
      },
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
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    if (!updatedAdmin)
      return res.json({
        status: false,
        message: "Admin not found.",
        data: null,
      });
    delete updateAdmin.password;
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

export const deleteFile = async (req, res) => {
  try {
    const { key } = req.body;
    const params = new DeleteObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: key,
    });
    await s3.send(params);
    res.json({
      status: true,
      message: "File deleted successfully.",
      data: null,
    });
  } catch (error) {
    res.json({ status: false, message: error.message, data: null });
  }
};
