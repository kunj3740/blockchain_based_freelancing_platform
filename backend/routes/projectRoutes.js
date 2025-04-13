import express from 'express';

import  { createProjectValidation, fundProjectValidation, projectIdValidation, updatePercentageValidation } from '../middleware/validation.js';
import { createProject, fundProject, getProject, getProjectsCount, markProjectCompleted, raiseDispute, releasePayment, resolveDisputeByPercentage, updateCompletionPercentage } from '../controllers/projectController.js';

const router = express.Router();

// Get projects count
router.get('/count', getProjectsCount);

// Get project details
router.get('/:id', projectIdValidation,getProject);

// Create a new project
router.post('/',createProjectValidation, createProject);

// Fund a project
router.post('/:id/fund', fundProjectValidation, fundProject
);

// Update completion percentage
router.put('/:id/percentage', updatePercentageValidation, updateCompletionPercentage);

// Mark project as completed
router.put('/:id/complete', projectIdValidation, markProjectCompleted);

// Release payment
router.post('/:id/pay', projectIdValidation, releasePayment);

// Raise dispute
router.post('/:id/dispute',projectIdValidation, raiseDispute);

// Resolve dispute by percentage
router.post('/:id/resolve-dispute', projectIdValidation, resolveDisputeByPercentage);

export default router;
