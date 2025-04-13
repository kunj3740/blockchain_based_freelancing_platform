import { body, param } from 'express-validator';
import { ethers } from 'ethers';

export const createProjectValidation = [
  body('clientAddress')
    .notEmpty()
    .withMessage('Client address is required')
    .custom(address => ethers.isAddress(address))
    .withMessage('Invalid Ethereum address format'),
  
  body('freelancerAddress')
    .notEmpty()
    .withMessage('Freelancer address is required')
    .custom(address => ethers.isAddress(address))
    .withMessage('Invalid Ethereum address format'),
  
  body('description')
    .notEmpty()
    .withMessage('Project description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters')
];

export const fundProjectValidation = [
  param('id')
    .notEmpty()
    .withMessage('Project ID is required')
    .isInt({ min: 0 })
    .withMessage('Project ID must be a non-negative integer'),
  
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.000001 })
    .withMessage('Amount must be greater than 0.000001 ETH')
];

export const updatePercentageValidation = [
  param('id')
    .notEmpty()
    .withMessage('Project ID is required')
    .isInt({ min: 0 })
    .withMessage('Project ID must be a non-negative integer'),
  
  body('percentage')
    .notEmpty()
    .withMessage('Percentage is required')
    .isInt({ min: 0, max: 100 })
    .withMessage('Percentage must be between 0 and 100')
];

export const projectIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Project ID is required')
    .isInt({ min: 0 })
    .withMessage('Project ID must be a non-negative integer')
];