// controllers/buyerController.js

import ClientModel from "../models/client.model.js";
// import gigModel from "../models/gig.model.js";
import OrderModel from "../models/order.model.js";

export async function getProfile(req, res) {
  try {
    const buyer = await ClientModel.findOne(req.user.id);
    res.json({
      success: true,
      data: buyer,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAllClient(req, res) {
  try {
    const clients = await ClientModel.find();
    res.json({
      success: true,
      data: clients,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getMyOrders(req, res) {
  try {
    const orders = await OrderModel.find({ buyer: req.user._id })
      .populate("gig")
      .populate("freelancer", "firstName lastName email");

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function addPaymentMethod(req, res) {
  try {
    const { type, details } = req.body;

    console.log("Auth user ID:", req.user?.id); // Check this value
    const buyer = await ClientModel.findById(req.user?.id);

    if (!buyer) {
      console.error("Buyer not found");
      return res.status(404).json({ error: "Buyer not found" });
    }

    console.log("Buyer found:", buyer);

    // Check if paymentMethods exists
    if (!Array.isArray(buyer.paymentMethods)) {
      console.log("paymentMethods was undefined. Initializing...");
      buyer.paymentMethods = [];
    }

    buyer.paymentMethods.push({
      type,
      details,
      isDefault: buyer.paymentMethods.length === 0,
    });

    console.log("Updated paymentMethods:", buyer.paymentMethods);

    await buyer.save();

    res.json({
      success: true,
      data: buyer.paymentMethods,
    });
  } catch (error) {
    console.error("Error in addPaymentMethod:", error);
    res.status(500).json({ error: error.message });
  }
}


export async function getFavorites(req, res) {
  try {
    const buyer = await ClientModel.findById(req.user._id).populate(
      "favorites"
    );

    res.json({
      success: true,
      data: buyer.favorites,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function addToFavorites(req, res) {
  try {
    const { gigId } = req.params;
    const buyer = await ClientModel.findById(req.user._id);

    if (!buyer) {
      return res.status(404).json({ error: "Buyer not found" });
    }

    if (buyer.favorites.includes(gigId)) {
      return res.status(400).json({ error: "Gig already in favorites" });
    }

    buyer.favorites.push(gigId);
    await buyer.save();

    res.json({
      success: true,
      message: "Added to favorites",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function removeFromFavorites(req, res) {
  try {
    const { gigId } = req.params;
    const buyer = await ClientModel.findById(req.user.id);

    buyer.favorites = buyer.favorites.filter((id) => id.toString() !== gigId);
    await buyer.save();

    res.json({
      success: true,
      message: "Removed from favorites",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// export async function createReview(req, res) {
//   try {
//     const { orderId, rating, comment } = req.body;

//     const order = await findOne({
//       _id: orderId,
//       buyer: req.user.id,
//       status: "completed",
//     });

//     if (!order) {
//       return res
//         .status(404)
//         .json({ error: "Order not found or not completed" });
//     }

//     const review = await Review.create({
//       order: orderId,
//       gig: order.gig,
//       reviewer: req.user.id,
//       rating,
//       comment,
//     });

//     // Update gig rating
//     const gig = await _findById(order.gig);
//     gig.updateRating(rating);
//     await gig.save();

//     res.status(201).json({
//       success: true,
//       data: review,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// }
