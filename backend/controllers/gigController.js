import Gig from "../models/gig.model.js";

// Get all gigs with filtering and pagination
export const getAllGigs = async (req, res) => {
  try {
    // Execute query with pagination
    const gigs = await Gig.find()
      .populate("freelancer", "firstName lastName")
      .populate("category", "name");

    // Get total documents

    res.status(200).json({
      success: true,
      data: gigs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update gig
export const updateGig = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find gig and check ownership
    const gig = await Gig.findOne({
      _id: id,
      freelancer: req.user._id,
    });

    if (!gig) {
      return res.status(404).json({
        success: false,
        error: "Gig not found or unauthorized",
      });
    }

    // List of allowed fields to update
    const allowedUpdates = [
      "title",
      "description",
      "category",
      "packages",
      "tags",
      "images",
    ];

    // Filter out unwanted fields
    const filteredUpdates = Object.keys(updates)
      .filter((key) => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    // Update gig
    Object.assign(gig, filteredUpdates);
    await gig.save();

    res.status(200).json({
      success: true,
      data: gig,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete gig
export const deleteGig = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete gig
    const gig = await Gig.findOneAndDelete({
      _id: id,
      freelancer: req.user._id,
    });

    if (!gig) {
      return res.status(404).json({
        success: false,
        error: "Gig not found or unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Gig deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const createGig = async (req, res) => {
  try {
    const { title, description, category, packages, tags, images } = req.body;

    // Create new gig
    const gig = new Gig({
      freelancer: req.user._id,
      title,
      description,
      category,
      packages,
      tags: tags || [],
      images: images || [],
    });

    // Save gig
    await gig.save();

    res.status(201).json({
      success: true,
      data: gig,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get gig by ID
export const getGigById = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate("freelancer", "firstName lastName")
      .populate("category", "name");

    if (!gig) {
      return res.status(404).json({
        success: false,
        error: "Gig not found",
      });
    }

    res.status(200).json({
      success: true,
      data: gig,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
