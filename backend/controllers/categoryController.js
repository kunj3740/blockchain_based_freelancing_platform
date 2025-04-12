// controllers/categoryController.js

import CategoryModel from "../models/category.model.js";

export async function createCategory(req, res) {
  try {
    const { name, description, icon } = req.body;

    // Check if category already exists
    const existingCategory = await CategoryModel.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ error: "Category already exists" });
    }

    const category = new CategoryModel({
      name,
      description,
      icon,
    });

    await category.save();

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAllCategories(req, res) {
  try {
    const categories = await CategoryModel.find()
      .select("name description icon subCategories")
      .sort("name");

    // Add gig count for each category

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getCategoryById(req, res) {
  try {
    const category = await CategoryModel.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Get related statistics
    const stats = {
      totalGigs: await countDocuments({
        category: category._id,
        isActive: true,
      }),
      averagePrice: await aggregate([
        { $match: { category: category._id } },
        {
          $group: {
            _id: null,
            avg: { $avg: "$packages.basic.price" },
          },
        },
      ]),
    };

    res.json({
      success: true,
      data: { ...category.toObject(), stats },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateCategory(req, res) {
  try {
    const allowedUpdates = ["name", "description", "icon", "isActive"];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({ error: "Invalid updates" });
    }

    const category = await CategoryModel.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    updates.forEach((update) => (category[update] = req.body[update]));
    await category.save();

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function addSubcategory(req, res) {
  try {
    const { name, description } = req.body;
    const category = await CategoryModel.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Check if subcategory already exists
    const subcategoryExists = category.subCategories.some(
      (sub) => sub.name.toLowerCase() === name.toLowerCase()
    );

    if (subcategoryExists) {
      return res.status(400).json({ error: "Subcategory already exists" });
    }

    category.subCategories.push({ name, description });
    await category.save();

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteCategory(req, res) {
  try {
    const category = await CategoryModel.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Check if category has active gigs
    const hasGigs = await exists({ category: category._id });
    if (hasGigs) {
      // Soft delete - just mark as inactive
      category.isActive = false;
      await category.save();
    } else {
      // Hard delete if no gigs are associated
      await category.remove();
    }

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
