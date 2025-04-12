// controllers/contractController.js
import Contract from "../models/Contract.js";
import Message from "../models/Message.js";
import mongoose from "mongoose";
export const createError = (status, message) => {
    const err = new Error();
    err.status = status;
    err.message = message;
    return err;
  };
// Create a new contract
export const createContract = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { description, amount, messageId, freelancerId, clientId } = req.body;
    
    // Validate required fields
    if (!description || !amount || !messageId || !freelancerId || !clientId) {
      return next(createError(400, "Missing required fields"));
    }

    // Check if message exists
    const message = await Message.findById(messageId);
    if (!message) {
      return next(createError(404, "Message not found"));
    }

    // Create the contract
    const contract = new Contract({
      description,
      amount,
      message: messageId,
      freelancer: freelancerId,
      client: clientId,
    });

    const savedContract = await contract.save({ session });

    // Update the message to reference this contract
    message.contract = savedContract._id;
    message.metadata = {
      ...message.metadata,
      type: "contract",
      relatedId: savedContract._id
    };
    
    await message.save({ session });

    await session.commitTransaction();
    
    res.status(201).json(savedContract);
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

// Get a specific contract by ID
export const getContract = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate("message")
      .populate("freelancer")
      .populate("client");
      
    if (!contract) {
      return next(createError(404, "Contract not found"));
    }
    
    // Check if user is authorized to view this contract
    if (
      req.user.id.toString() !== contract.freelancer._id.toString() &&
      req.user.id.toString() !== contract.client._id.toString() &&
      req.user.id.toString() !== contract.createdBy.toString()
    ) {
      return next(createError(403, "You are not authorized to view this contract"));
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
    if (req.user.id.toString() !== userId) {
      return next(createError(403, "You can only access your own contracts"));
    }
    
    const contracts = await Contract.find({
      $or: [
        { freelancer: userId },
        { client: userId }
      ]
    })
    .sort({ createdAt: -1 })
    .populate("message")
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
    const userId = req.user.id;
    
    const contracts = await Contract.find({
      $or: [
        { freelancer: userId },
        { client: userId }
      ],
      isApproved: true,
      isCompleted: false
    })
    .sort({ updatedAt: -1 })
    .populate("message")
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
      $or: [
        { freelancer: userId },
        { client: userId }
      ],
      isCompleted: true
    })
    .sort({ updatedAt: -1 })
    .populate("message")
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
    const userId = req.user.id;
    
    const contracts = await Contract.find({
      $or: [
        { freelancer: userId },
        { client: userId }
      ],
      isApproved: false,
      isCompleted: false
    })
    .sort({ createdAt: -1 })
    .populate("message")
    .populate("freelancer")
    .populate("client");
    
    res.status(200).json(contracts);
  } catch (err) {
    next(err);
  }
};

// Update a contract (only creator or assigned freelancer can update)
export const updateContract = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id);
    
    if (!contract) {
      return next(createError(404, "Contract not found"));
    }
    
    // Check if contract is already approved
    if (contract.isApproved) {
      return next(createError(400, "Cannot update an approved contract"));
    }
    
    // Check if user is authorized to update this contract
    if (
      req.user.id.toString() !== contract.freelancer.toString() &&
      req.user.id.toString() !== contract.createdBy.toString()
    ) {
      return next(createError(403, "You are not authorized to update this contract"));
    }
    
    // Allow updating only specific fields
    const allowedUpdates = ["description", "amount"];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    // Add updatedBy information
    updates.updatedBy = req.user.id;
    updates.updatedByType = req.user.type;
    
    const updatedContract = await Contract.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );
    
    res.status(200).json(updatedContract);
  } catch (err) {
    next(err);
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
      return next(createError(403, "You are not authorized to delete this contract"));
    }
    
    // Update the message to remove contract reference
    await Message.findByIdAndUpdate(
      contract.message,
      { 
        $unset: { contract: "" },
        $set: { 
          "metadata.type": "text",
          "metadata.relatedId": null
        }
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
    if (req.user.id.toString() !== contract.client.toString()) {
      return next(createError(403, "Only the client can approve a contract"));
    }
    
    // Check if contract is already approved
    if (contract.isApproved) {
      return next(createError(400, "Contract is already approved"));
    }
    
    contract.isApproved = true;
    contract.updatedBy = req.user.id;
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
    if (req.user.id.toString() !== contract.client.toString()) {
      return next(createError(403, "Only the client can mark a contract as completed"));
    }
    
    // Check if contract is approved
    if (!contract.isApproved) {
      return next(createError(400, "Contract must be approved before it can be completed"));
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