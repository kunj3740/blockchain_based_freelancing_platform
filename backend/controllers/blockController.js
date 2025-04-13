
import { 
    createProject, 
    fundProject, 
    getProject, 
    getProjectsCount, 
    markProjectCompleted, 
    raiseDispute, 
    releasePayment, 
    resolveDisputeByPercentage, 
    updateCompletionPercentage 
  } from '../services/blockchainService.js';
  
  // Create a new project
  export const createNewProject = async (req, res) => {
    try {
      console.log('Request body:', req.body);
      
      // Check if req.body exists
      if (!req.body) {
        return res.status(400).json({ error: 'Request body is missing' });
      }
      
      const { clientAddress, freelancerAddress, description } = req.body;
      
      // Validate required fields
      if (!clientAddress || !freelancerAddress || !description) {
        return res.status(400).json({ 
          error: 'Missing required fields', 
          required: ['clientAddress', 'freelancerAddress', 'description'],
          received: req.body
        });
      }
      
      const result = await createProject(clientAddress, freelancerAddress, description);
      
      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: result
      });
    } catch (error) {
      console.error('Controller error creating project:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  // Get a project by ID
  export const getProjectById = async (req, res) => {
    try {
      const projectId = req.params.projectId;
      
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
      }
      
      const projectData = await getProject(projectId);
      
      res.status(200).json({
        success: true,
        data: projectData
      });
    } catch (error) {
      console.error('Controller error getting project:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  // Get total project count
  export const getProjectCount = async (req, res) => {
    try {
      const count = await getProjectsCount();
      
      res.status(200).json({
        success: true,
        count: count.toString()
      });
    } catch (error) {
      console.error('Controller error getting project count:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  // Fund a project
  export const fundProjectById = async (req, res) => {
    try {
      const { projectId } = req.params;
      const { amount } = req.body;
      
      if (!projectId || !amount) {
        return res.status(400).json({ 
          error: 'Project ID and amount are required',
          received: { projectId, amount }
        });
      }
      
      const result = await fundProject(projectId, amount);
      
      res.status(200).json({
        success: true,
        message: 'Project funded successfully',
        data: result
      });
    } catch (error) {
      console.error('Controller error funding project:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  // Update project completion percentage
  export const updateProjectCompletion = async (req, res) => {
    try {
      const { projectId } = req.params;
      const { percentage } = req.body;
      
      if (!projectId || percentage === undefined) {
        return res.status(400).json({ 
          error: 'Project ID and percentage are required',
          received: { projectId, percentage }
        });
      }
      
      const result = await updateCompletionPercentage(projectId, percentage);
      
      res.status(200).json({
        success: true,
        message: 'Project completion percentage updated successfully',
        data: result
      });
    } catch (error) {
      console.error('Controller error updating completion percentage:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  // Mark project as completed
  export const completeProject = async (req, res) => {
    try {
      const { projectId } = req.params;
      
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
      }
      
      const result = await markProjectCompleted(projectId);
      
      res.status(200).json({
        success: true,
        message: 'Project marked as completed',
        data: result
      });
    } catch (error) {
      console.error('Controller error marking project as completed:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  // Release payment to freelancer
  export const releaseProjectPayment = async (req, res) => {
    try {
      const { projectId } = req.params;
      
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
      }
      
      const result = await releasePayment(projectId);
      
      res.status(200).json({
        success: true,
        message: 'Payment released successfully',
        data: result
      });
    } catch (error) {
      console.error('Controller error releasing payment:', error);
      res.status(500).json({ error: error.message });
    }
  };