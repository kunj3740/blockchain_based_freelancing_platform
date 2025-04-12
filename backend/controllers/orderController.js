// controllers/orderController.js
import Order from "../models/order.model.js";
import OrderModel from "../models/order.model.js";
import FreelancerModel from "../models/freelancer.model.js";
import gigModel from "../models/gig.model.js";

export async function createOrder(req, res) {
  try {
    const { gigId, selectedPackage, buyer } = req.body;

    const gig = await gigModel.findById(gigId);
    if (!gig) {
      return res.status(404).json({ error: "Gig not found" });
    }

    const pkg = gig.packages[selectedPackage];
    if (!pkg) {
      return res.status(400).json({ error: "Selected package not found" });
    }

    const order = new Order({
      gig: gigId,
      buyer: buyer,
      freelancer: gig.freelancer,
      package: selectedPackage, // 'basic' | 'standard' | 'premium'
      packageDetails: {
        description: pkg.description,
        deliveryTime: pkg.deliveryTime,
        price: pkg.price,
        revisions: pkg.revisions,
        features: pkg.features || [], // default to empty array if not present
      },
      payment: {
        status: "pending",
        amount: pkg.price,
      },
    });

    await order.save();

    res.status(201).json({
      success: true,
      data: {
        order,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getOrderById(req, res) {
  try {
    console.log(req.params.id);
    const order = await OrderModel.findById(req.params.id)
      .populate("gig")
      .populate("buyer", "firstName lastName email")
      .populate("freelancer", "firstName lastName email");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Check if user is authorized to view this order
    if (
      order.buyer?.toString?.() !== req.user.id &&
      order.freelancer?.toString?.() !== req.user.id
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getFreelancerOrder(req, res) {
  try {
    const { id } = req.params;
    const order = await Order.find({
      freelancer: id,
    });

    res.json({ order });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
}

export async function deliverOrder(req, res) {
  try {
    const { deliverables, message } = req.body;
    const order = await OrderModel.findOne({
      _id: req.params.id,
      freelancer: req.user.id,
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.deliveredWork.push({
      deliverables,
      message,
      deliveredAt: Date.now(),
    });
    order.status = "delivered";
    await order.save();

    // Send notification to buyer
    // Implement notification logic here

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function acceptDelivery(req, res) {
  try {
    const order = await OrderModel.findOne({
      _id: req.params.id,
      buyer: req.user.id,
      status: "delivered",
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = "completed";
    order.completedAt = Date.now();
    await order.save();

    // Release payment to freelancer
    // Implement payment release logic here

    // Update freelancer stats
    const freelancer = await FreelancerModel.findById(order.freelancer);
    freelancer.completedProjects += 1;
    freelancer.totalEarnings += order.price;
    await freelancer.save();

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function requestRevision(req, res) {
  try {
    const { revisionMessage } = req.body;
    const order = await OrderModel.findOne({
      _id: req.params.id,
      buyer: req.user.id,
      status: "delivered",
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.revision.count >= order.revision.available) {
      return res.status(400).json({ error: "No more revisions available" });
    }

    order.status = "revision_requested";
    order.revision.count += 1;
    order.revision.messages.push({
      message: revisionMessage,
      timestamp: Date.now(),
    });

    await order.save();

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
