// controllers/contractController.js
import mongoose from "mongoose";
import FreelancerModel from "../models/freelancer.model.js";
import ClientModel from "../models/client.model.js";
import Contract from "../models/contract.model.js";

export const createError = (status, message) => {
  const err = new Error();
  err.status = status;
  err.message = message;
  return err;
};

// Create a new contract
export const createContract = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { description, amount, freelancerId, clientId } = req.body;

    // Validate required fields
    if (!description || !amount || !freelancerId || !clientId) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if freelancer exists
    const freelancer = await FreelancerModel.findById(freelancerId);
    if (!freelancer) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Freelancer not found" });
    }

    // Check if client exists
    const client = await ClientModel.findById(clientId);
    if (!client) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Client not found" });
    }

    // Create the contract
    const contract = new Contract({
      description,
      amount,
      freelancer: freelancerId,
      client: clientId,
    });

    const savedContract = await contract.save({ session });

    await session.commitTransaction();
    res.status(201).json(savedContract);
  } catch (err) {
    console.log(err.message);
    await session.abortTransaction();
    console.error("Create Contract Error:", err);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: err.message });
  } finally {
    session.endSession();
  }
};

export const checkContract = async (req, res) => {
  try {
    const { freelancerId, clientId } = req.body;

    if (!freelancerId || !clientId) {
      return res
        .status(400)
        .json({ error: "Freelancer and client ID are required" });
    }

    // Find existing contract
    const contract = await Contract.findOne({
      freelancer: freelancerId,
      client: clientId,
    });

    if (!contract) {
      return res.status(404).json({ message: "No contract found" });
    }

    res.status(200).json({ contract: contract, success: true });
  } catch (err) {
    console.error("Error checking contract:", err);
    res.status(500).json({
      error: "Internal Server Error",
      details: err.message,
      success: false,
    });
  }
};

export const editContract = async (req, res) => {
  try {
    const { description, amount, freelancerId, clientId } = req.body;

    if (!freelancerId || !clientId) {
      return res
        .status(400)
        .json({ error: "Freelancer and client ID are required" });
    }

    // Find existing contract
    const contract = await Contract.findOne({
      freelancer: freelancerId,
      client: clientId,
    });

    if (!contract) {
      return res.status(404).json({ message: "No contract found" });
    }

    contract.description = description;
    contract.amount = amount;

    await contract;

    res.status(200).json({ contract: contract, success: true });
  } catch (err) {
    console.error("Error checking contract:", err);
    res.status(500).json({
      error: "Internal Server Error",
      details: err.message,
      success: false,
    });
  }
};

// Get a specific contract by ID
export const getContract = async (req, res, next) => {
  try {
    console.log(req.user);
    const contract = await Contract.findById(req.params.id)
      .populate("freelancer")
      .populate("client");

    if (!contract) {
      return next(createError(404, "Contract not found"));
    }
    console.log(contract);
    // Check if user is authorized to view this contract
    if (
      req.user._id.toString() !== contract.freelancer._id.toString() &&
      req.user._id.toString() !== contract.client._id.toString()
    ) {
      return next(
        createError(403, "You are not authorized to view this contract")
      );
    }

    res.status(200).json(contract);
  } catch (err) {
    next(err);
  }
};

// Get contracts by user (either as client or freelancer)
export const getContractsByUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    // Ensure the requesting user can only access their own contracts
    if (req.user._id.toString() !== userId) {
      return next(createError(403, "You can only access your own contracts"));
    }

    const contracts = await Contract.find({
      $or: [{ freelancer: userId }, { client: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("freelancer")
      .populate("client");

    res.status(200).json(contracts);
  } catch (err) {
    next(err);
  }
};

// Get active contracts (approved but not completed)
export const getActiveContracts = async (req, res, next) => {
  try {
    const userId = req.user._id;
    console.log(userId);
    const contracts = await Contract.find({
      $or: [{ freelancer: userId }, { client: userId }],
      isApproved: true,
      isCompleted: false,
    })
      .sort({ updatedAt: -1 })
      .populate("freelancer")
      .populate("client");

    res.status(200).json(contracts);
  } catch (err) {
    next(err);
  }
};

// Get completed contracts
export const getCompletedContracts = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const contracts = await Contract.find({
      $or: [{ freelancer: userId }, { client: userId }],
      isCompleted: true,
    })
      .sort({ updatedAt: -1 })
      .populate("freelancer")
      .populate("client");

    res.status(200).json(contracts);
  } catch (err) {
    next(err);
  }
};

// Get contracts pending approval
export const getPendingApprovalContracts = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const contracts = await Contract.find({
      $or: [{ freelancer: userId }, { client: userId }],
      isApproved: false,
      isCompleted: false,
    })
      .sort({ createdAt: -1 })
      .populate("freelancer")
      .populate("client");

    res.status(200).json(contracts);
  } catch (err) {
    next(err);
  }
};

// Update a contract (only creator or assigned freelancer can update)
export const updateContract = async (req, res) => {
  try {
    console.log(req.params.id);
    const contract = await Contract.findById(req.params.id);
    console.log(contract, "contrxt");
    if (!contract) {
      return res.status(404).json({ error: "Contract not found" });
    }

    if (contract.isApproved) {
      return res
        .status(400)
        .json({ error: "Cannot update an approved contract" });
    }

    if (
      req.user._id.toString() !== contract.freelancer.toString() &&
      req.user._id.toString() !== contract.createdBy.toString()
    ) {
      return res
        .status(403)
        .json({ error: "You are not authorized to update this contract" });
    }

    console.log("first");

    const allowedUpdates = ["description", "amount"];
    allowedUpdates.forEach((key) => {
      if (req.body[key] !== undefined) {
        contract[key] = req.body[key];
      }
    });

    // Set approval and tracking
    contract.isApproved = true;
    contract.updatedBy = req.user._id;
    contract.updatedByType = req.user.type;

    await contract.save();

    res.status(200).json(contract);
  } catch (err) {
    console.error("Update Contract Error:", err);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: err.message });
  }
};

// Delete a contract (only if not approved yet)
export const deleteContract = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return next(createError(404, "Contract not found"));
    }

    // Check if contract is already approved
    if (contract.isApproved) {
      return next(createError(400, "Cannot delete an approved contract"));
    }

    // Check if user is authorized to delete this contract
    if (
      req.user.id.toString() !== contract.createdBy.toString() &&
      req.user.id.toString() !== contract.client.toString()
    ) {
      return next(
        createError(403, "You are not authorized to delete this contract")
      );
    }

    // Update the message to remove contract reference
    await Message.findByIdAndUpdate(
      contract.message,
      {
        $unset: { contract: "" },
        $set: {
          "metadata.type": "text",
          "metadata.relatedId": null,
        },
      },
      { session }
    );

    // Delete the contract
    await Contract.findByIdAndDelete(req.params.id, { session });

    await session.commitTransaction();

    res.status(200).json({ message: "Contract deleted successfully" });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

// Approve a contract (only client can approve)
export const approveContract = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return next(createError(404, "Contract not found"));
    }

    // Check if user is the client
    if (req.user._id.toString() !== contract.client.toString()) {
      return next(createError(403, "Only the client can approve a contract"));
    }

    // Check if contract is already approved
    if (contract.isApproved) {
      return next(createError(400, "Contract is already approved"));
    }

    contract.isApproved = true;
    contract.updatedBy = req.user._id;
    contract.updatedByType = req.user.type;

    const updatedContract = await contract.save();

    res.status(200).json(updatedContract);
  } catch (err) {
    next(err);
  }
};

// Mark a contract as completed (only client can mark as completed)
export const completeContract = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return next(createError(404, "Contract not found"));
    }

    // Check if user is the client
    if (req.user._id.toString() !== contract.client.toString()) {
      return next(
        createError(403, "Only the client can mark a contract as completed")
      );
    }

    // Check if contract is approved
    if (!contract.isApproved) {
      return next(
        createError(400, "Contract must be approved before it can be completed")
      );
    }

    // Check if contract is already completed
    if (contract.isCompleted) {
      return next(createError(400, "Contract is already completed"));
    }

    contract.isCompleted = true;
    contract.updatedBy = req.user.id;
    contract.updatedByType = req.user.type;

    const updatedContract = await contract.save();

    // Here you could trigger blockchain operations or smart contract execution
    // such as releasing funds from escrow

    res.status(200).json(updatedContract);
  } catch (err) {
    next(err);
  }
};
