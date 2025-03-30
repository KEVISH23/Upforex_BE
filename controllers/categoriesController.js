import { Category } from "../models/index.js";

export const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({
      status: true,
      message: "Category created successfully!",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json({
      status: true,
      message: "Categories fetched successfully!",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        status: false,
        message: "Category not found!",
        data: null,
      });
    }
    res.json({
      status: true,
      message: "Category fetched successfully!",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        status: false,
        message: "Category not found!",
        data: null,
      });
    }

    res.json({
      status: true,
      message: "Category updated successfully!",
      data: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);

    if (!deletedCategory) {
      return res.status(404).json({
        status: false,
        message: "Category not found!",
        data: null,
      });
    }

    res.json({
      status: true,
      message: "Category deleted successfully!",
      data: deletedCategory,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};
