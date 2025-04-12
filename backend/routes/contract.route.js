// routes/contractRoutes.js
import express from "express";
import {
  createContract,
  getContract,
  getContractsByUser,
  updateContract,
  deleteContract,
  approveContract,
  completeContract,
  getActiveContracts,
  getCompletedContracts,
  getPendingApprovalContracts,
} from "../controllers/contractController.js";
import {auth as  authenticate } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware to all contract routes
router.use(authenticate);

// Create a new contract
router.post("/", createContract);

// Get a specific contract by ID
router.get("/:id", getContract);

// Get contracts by user (either as client or freelancer)
router.get("/user/:userId", getContractsByUser);

// Get active contracts (approved but not completed)
router.get("/status/active", getActiveContracts);

// Get completed contracts
router.get("/status/completed", getCompletedContracts);

// Get contracts pending approval
router.get("/status/pending", getPendingApprovalContracts);

// Update a contract (only creator or assigned freelancer can update)
router.put("/:id", updateContract);

// Delete a contract (only if not approved yet)
router.delete("/:id", deleteContract);

// Approve a contract (only client can approve)
router.patch("/:id/approve", approveContract);

// Mark a contract as completed (only client can mark as completed)
router.patch("/:id/complete", completeContract);

export default router;