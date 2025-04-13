import express from 'express';
import { body, param } from 'express-validator';
import { 
  createNewProject,
  getProjectById, 
  getProjectCount,
  fundProjectById,
  updateProjectCompletion,
  completeProject,
  releaseProjectPayment,
  raiseProjectDispute,
  resolveProjectDispute
} from '../controllers/projectController.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

// Create project route
router.post(
  '/',
  [
    body('clientAddress').isEthereumAddress().withMessage('Valid client Ethereum address is required'),
    body('freelancerAddress').isEthereumAddress().withMessage('Valid freelancer Ethereum address is required'),
    body('description').notEmpty().withMessage('Project description is required')
  ],
  validateRequest,
  createNewProject
);

// Get project by ID
router.get(
  '/:projectId',
  [
    param('projectId').isInt().withMessage('Project ID must be an integer')
  ],
  validateRequest,
  getProjectById
);

// Get total project count
router.get('/count', getProjectCount);

// Fund a project
router.post(
  '/:projectId/fund',
  [
    param('projectId').isInt().withMessage('Project ID must be an integer'),
    body('amount').isNumeric().withMessage('Amount must be a number')
  ],
  validateRequest,
  fundProjectById
);

// Update project completion percentage
router.put(
  '/:projectId/completion',
  [
    param('projectId').isInt().withMessage('Project ID must be an integer'),
    body('percentage').isInt({ min: 0, max: 100 }).withMessage('Percentage must be between 0 and 100')
  ],
  validateRequest,
  updateProjectCompletion
);

// Mark project as completed
router.put(
  '/:projectId/complete',
  [
    param('projectId').isInt().withMessage('Project ID must be an integer')
  ],
  validateRequest,
  completeProject
);

// Release payment
router.post(
  '/:projectId/payment',
  [
    param('projectId').isInt().withMessage('Project ID must be an integer')
  ],
  validateRequest,
  releaseProjectPayment
);

// Raise dispute
router.post(
  '/:projectId/dispute',
  [
    param('projectId').isInt().withMessage('Project ID must be an integer')
  ],
  validateRequest,
  raiseProjectDispute
);

// Resolve dispute
router.put(
  '/:projectId/dispute/resolve',
  [
    param('projectId').isInt().withMessage('Project ID must be an integer')
  ],
  validateRequest,
  resolveProjectDispute
);

export default router;