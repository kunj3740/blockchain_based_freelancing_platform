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
  checkContract,
  editContract,
  addContractTask,
  getAddedTask,
  editTaskData,
} from "../controllers/contractController.js";
import { auth as authenticate } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware to all contract routes
router.use(authenticate);

// Create a new contract
router.post("/", createContract);

router.post("/check", checkContract);

router.post("/edit/:id", editContract);

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

router.post("/task/:id", editTaskData);

// Update a contract (only creator or assigned freelancer can update)
router.put("/:id", updateContract);

// Delete a contract (only if not approved yet)
router.delete("/:id", deleteContract);

// Approve a contract (only client can approve)
router.patch("/:id/approve", approveContract);

// Mark a contract as completed (only client can mark as completed)
router.patch("/:id/complete", completeContract);

router.post("/:contractId/tasks", addContractTask);

router.get("/:contractId/tasks", getAddedTask);

export default router;
