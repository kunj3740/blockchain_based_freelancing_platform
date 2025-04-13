// controllers/freelancerController.js
import FreelancerModel from "../models/freelancer.model.js";
import OrderModel from "../models/order.model.js"; // Import for orders
import JurorMOdel from "../models/juror.model.js";

// Get freelancer profile
export async function getProfile(req, res) {
  try {
    const freelancer = await FreelancerModel.findById(req.user._id)
      .populate("skills") // Assuming skills is an array of ObjectId references
      .populate("portfolio") // Populating portfolio items
      .populate("education") // Populating education items
      .populate("experience") // Populating experience items
      .populate("categories") // Populating categories if needed
      // .populate("activeGigs") // Populating active gigs if needed
      .populate("activeOrders"); // Populating active orders if needed

    res.json({
      success: true,
      data: freelancer,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Add education
export async function addEducation(req, res) {
  try {
    const freelancerId = req.user._id;
    const newEducation = req.body;

    const freelancer = await FreelancerModel.findById(freelancerId);
    if (!freelancer) {
      return res.status(404).json({ error: "Freelancer not found" });
    }

    // Add the new education entry
    freelancer.education.push(newEducation);
    await freelancer.save();

    // Return the last added education entry
    const addedEducation =
      freelancer.education[freelancer.education.length - 1];
    console.log("Added education:", addedEducation);
    res.status(200).json(addedEducation);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Add experience
export const addExperience = async (req, res) => {
  const { title, company, location, startDate, endDate, description, current } =
    req.body;

  // Validate the input data
  if (!title || !company || !location || !startDate) {
    return res.status(400).json({
      message: "Title, company, location, and start date are required.",
    });
  }

  try {
    const freelancerId = req.user._id;
    const freelancer = await FreelancerModel.findById(freelancerId);
    if (!freelancer) {
      return res.status(404).json({ message: "Freelancer not found." });
    }

    // Create the new experience object
    const newExperience = {
      title,
      company,
      location,
      startDate,
      endDate,
      description,
      current,
    };

    // Add the new experience to the freelancer's experience array
    freelancer.experience.push(newExperience);
    await freelancer.save();

    // Return the updated experience
    res.status(201).json(newExperience);
  } catch (error) {
    res.status(500).json({ message: "Failed to add experience" });
  }
};

// Add portfolio item
export const addPortfolioItem = async (req, res) => {
  console.log("Adding portfolio item:", req.body);
  const { title, techStack, description, images, link, category } = req.body;

  // Validate the input data
  if (!title || !description) {
    return res.status(400).json({
      message: "Project name, tech stack, and description are required.",
    });
  }

  try {
    const freelancerId = req.user._id;
    const freelancer = await FreelancerModel.findById(freelancerId);
    if (!freelancer) {
      return res.status(404).json({ message: "Freelancer not found." });
    }
    console.log("Freelancer found:", freelancer);
    // Create the new portfolio item object
    const newPortfolioItem = {
      title,
      techStack,
      description,
      images,
      link,
      category,
    };
    console.log("New portfolio item:", newPortfolioItem);
    // Add the new portfolio item to the freelancer's portfolio array
    freelancer.portfolio.push(newPortfolioItem);
    await freelancer.save();
    console.log("Portfolio item added:", freelancer.portfolio);
    // Return the updated portfolio item
    res.status(201).json(newPortfolioItem);
  } catch (error) {
    res.status(500).json({ message: "Failed to add portfolio item" });
  }
};

// Update portfolio item
export async function updatePortfolioItem(req, res) {
  try {
    const { id } = req.params;
    const freelancer = await FreelancerModel.findById(req.user.id);
    if (!freelancer) {
      return res.status(404).json({ error: "Freelancer not found" });
    }

    const portfolioIndex = freelancer.portfolio.findIndex(
      (item) => item._id.toString() === id
    );

    if (portfolioIndex === -1) {
      return res.status(404).json({ error: "Portfolio item not found" });
    }

    freelancer.portfolio[portfolioIndex] = {
      ...freelancer.portfolio[portfolioIndex],
      ...req.body,
    };

    await freelancer.save();

    res.json({
      success: true,
      data: freelancer.portfolio[portfolioIndex],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get earnings
export async function getEarnings(req, res) {
  try {
    const orders = await OrderModel.find({
      freelancer: req.user.id,
      status: "completed",
    });

    const earnings = {
      total: 0,
      monthly: {},
      pending: 0,
    };

    orders.forEach((order) => {
      if (order.completedAt) {
        const month = order.completedAt.getMonth() + 1;
        const year = order.completedAt.getFullYear();
        const key = `${year}-${month}`;

        earnings.total += order.payment.amount;
        earnings.monthly[key] =
          (earnings.monthly[key] || 0) + order.payment.amount;
      }
    });

    const pendingOrders = await OrderModel.find({
      freelancer: req.user.id,
      status: { $in: ["in_progress", "delivered"] },
    });

    earnings.pending = pendingOrders.reduce(
      (sum, order) => sum + order.payment.amount,
      0
    );

    res.json({
      success: true,
      data: earnings,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Delete portfolio item
export async function deletePortfolioItem(req, res) {
  try {
    const { id } = req.params;
    const freelancer = await FreelancerModel.findById(req.user.id);
    if (!freelancer) {
      return res.status(404).json({ error: "Freelancer not found" });
    }

    const portfolioIndex = freelancer.portfolio.findIndex(
      (item) => item._id.toString() === id
    );

    if (portfolioIndex === -1) {
      return res.status(404).json({ error: "Portfolio item not found" });
    }

    freelancer.portfolio.splice(portfolioIndex, 1);
    await freelancer.save();

    res.json({
      success: true,
      message: "Portfolio item deleted successfully",
      data: freelancer.portfolio,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update skills
export async function updateSkills(req, res) {
  try {
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return res.status(400).json({ error: "Skills must be an array" });
    }

    const freelancer = await FreelancerModel.findByIdAndUpdate(
      req.user.id,
      { skills },
      { new: true }
    );

    if (!freelancer) {
      return res.status(404).json({ error: "Freelancer not found" });
    }

    res.json({
      success: true,
      message: "Skills updated successfully",
      data: freelancer.skills,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get all freelancers
export async function getAllFreelancer(req, res) {
  try {
    const freelancers = await FreelancerModel.find();
    res.json({
      success: true,
      data: freelancers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function addJuror(req, res) {
  const { userId } = req.body;
  console.log("Adding juror:", userId);
  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    // Check if already a juror
    const existingJuror = await JurorMOdel.findOne({ userId });

    if (existingJuror) {
      existingJuror.isAvailable = true;
      await existingJuror.save();
      return res
        .status(200)
        .json({ message: "Juror status updated to available." });
    }

    // Create a new juror
    const newJuror = new JurorMOdel({
      userId,
      role: "freelancer", // You can dynamically get role from user model if needed
      isAvailable: true,
    });

    await newJuror.save();
    console.log("New juror added:", newJuror);
    return res.status(201).json({ message: "Juror created successfully." });
  } catch (error) {
    console.error("Error adding juror:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export async function getJuror(req, res) {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    // Find juror by userId
    const juror = await JurorMOdel.findOne({ userId });

    if (!juror) {
      return res.status(404).json({ message: "Juror not found." });
    }

    // Return juror status and info
    res.status(200).json({
      userId: juror.userId,
      isAvailable: juror.isAvailable,
      role: juror.role,
    });
  } catch (error) {
    console.error("Error fetching juror data:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}
// Controller for adding the wallet (metamaskId) to an existing freelancer
export async function addWallet(req, res) {
  try {
    console.log(req.body);
    const { metamaskId, userId } = req.body;
    // Check if metamaskId is provided in the request
    if (!metamaskId) {
      return res.status(400).json({ message: "Metamask ID is required" });
    }
    console.log(metamaskId);
    // Find freelancer by email (assuming email is unique)
    const freelancer = await FreelancerModel.findById(userId);
    console.log(freelancer);
    // If freelancer not found, return an error
    if (!freelancer) {
      return res.status(404).json({ message: "Freelancer not found" });
    }

    // Update freelancer's metamaskId
    freelancer.metamaskid = metamaskId;

    // Save the freelancer document
    await freelancer.save();
    console.log(freelancer);
    // Return success response
    res
      .status(200)
      .json({ message: "Metamask ID added successfully", freelancer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}
