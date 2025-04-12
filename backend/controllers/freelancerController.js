// controllers/freelancerController.js
import FreelancerModel from "../models/freelancer.model.js";
import OrderModel from "../models/order.model.js"; // Fix: Added import for orders

export async function getProfile(req, res) {
  try {
    const freelancer = await FreelancerModel.findById(req.user._id)
      .populate("skills")
      .populate("portfolio");
    // console.log(freelancer);
    res.json({
      success: true,
      data: freelancer,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function addPortfolioItem(req, res) {
  try {
    const freelancer = await FreelancerModel.findById(req.user._id);

    if (!freelancer) {
      return res.status(404).json({ error: "Freelancer not found" });
    }

    freelancer.portfolio.push(req.body);
    await freelancer.save();

    res.status(201).json({
      success: true,
      data: freelancer.portfolio,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

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

export async function getAllFreelancer(req, res) {
  try {
    const freelancer = await FreelancerModel.find();

    res.json({
      success: true,
      data: freelancer,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
