import { validationResult } from 'express-validator';
import {
    getProject as getProjectFromService,
    getProjectsCount as getProjectsCountFromService,
    createProject as createProjectOnChain,
    fundProject as fundProjectOnChain,
    updateCompletionPercentage as updateCompletionFromService,
    markProjectCompleted as markCompletedOnChain,
    releasePayment as releasePaymentOnChain,
    raiseDispute as raiseDisputeOnChain,
    resolveDisputeByPercentage as resolveDisputeOnChain
  } from '../services/blockchainService.js';
  
  


// Get project details
export async function getProject(req, res) {
    try {
      const projectId = req.params.id;
      const project = await getProjectFromService(projectId);
  
      res.status(200).json({
        success: true,
        data: project
      });
    } catch (error) {
      console.error('Controller error getting project:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving project details',
        error: error.message
      });
    }
  }
  
// Get projects count
export async function getProjectsCount(req, res) {
    try {
      const count = await getProjectsCountFromService();
  
      res.status(200).json({
        success: true,
        data: { count: count.toString() }
      });
    } catch (error) {
      console.error('Controller error getting projects count:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving projects count',
        error: error.message
      });
    }
  }
  

// Create a new project
export async function createProject(req, res) {
  // Validate request

  console.log("enter")
  console.log("REQ HEADERS:", req.headers);
console.log("REQ BODY:", req.body);

  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   return res.status(400).json({
  //     success: false,
  //     errors: errors.array()
  //   });
  // }
  
  try {
    const { clientAddress, freelancerAddress, description } = req.body;
    console.log(req.body)
    // Call blockchain service to create project
    const result = await createProject(
      clientAddress,
      freelancerAddress,
      description
    );
    console.log(result)
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: result
    });
  } catch (error) {
    console.error('Controller error creating project:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating project',
      error: error.message
    });
  }
}

// Fund a project
export async function fundProject(req, res) {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  try {
    const projectId = req.params.id;
    const { amount } = req.body;
    
    // Call blockchain service to fund project
    const result = await fundProject(projectId, amount);
    
    res.status(200).json({
      success: true,
      message: 'Project funded successfully',
      data: result
    });
  } catch (error) {
    console.error('Controller error funding project:', error);
    res.status(500).json({
      success: false,
      message: 'Error funding project',
      error: error.message
    });
  }
}

// Update completion percentage
export async function updateCompletionPercentage(req, res) {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  try {
    const projectId = req.params.id;
    const { percentage } = req.body;
    
    // Call blockchain service to update completion percentage
    const result = await updateCompletionPercentage(projectId, percentage);
    
    res.status(200).json({
      success: true,
      message: 'Completion percentage updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Controller error updating completion percentage:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating completion percentage',
      error: error.message
    });
  }
}

// Mark project as completed
export async function markProjectCompleted(req, res) {
  try {
    const projectId = req.params.id;
    
    // Call blockchain service to mark project as completed
    const result = await markProjectCompleted(projectId);
    
    res.status(200).json({
      success: true,
      message: 'Project marked as completed',
      data: result
    });
  } catch (error) {
    console.error('Controller error marking project as completed:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking project as completed',
      error: error.message
    });
  }
}

// Release payment
export async function releasePayment(req, res) {
  try {
    const projectId = req.params.id;
    
    // Call blockchain service to release payment
    const result = await releasePayment(projectId);
    
    res.status(200).json({
      success: true,
      message: 'Payment released successfully',
      data: result
    });
  } catch (error) {
    console.error('Controller error releasing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error releasing payment',
      error: error.message
    });
  }
}

// Raise dispute
export async function raiseDispute(req, res) {
  try {
    const projectId = req.params.id;
    
    // Call blockchain service to raise dispute
    const result = await raiseDispute(projectId);
    
    res.status(200).json({
      success: true,
      message: 'Dispute raised successfully',
      data: result
    });
  } catch (error) {
    console.error('Controller error raising dispute:', error);
    res.status(500).json({
      success: false,
      message: 'Error raising dispute',
      error: error.message
    });
  }
}

// Resolve dispute by percentage
export async function resolveDisputeByPercentage(req, res) {
  try {
    const projectId = req.params.id;
    
    // Call blockchain service to resolve dispute
    const result = await resolveDisputeByPercentage(projectId);
    
    res.status(200).json({
      success: true,
      message: 'Dispute resolved successfully',
      data: result
    });
  } catch (error) {
    console.error('Controller error resolving dispute:', error);
    res.status(500).json({
      success: false,
      message: 'Error resolving dispute',
      error: error.message
    });
  }
}