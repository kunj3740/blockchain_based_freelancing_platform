import { ethers } from 'ethers';
import contractConfig  from '../contracts/config.js';
import { readFile } from 'fs/promises';
// config.js
import dotenv from 'dotenv';
dotenv.config();
import  express  from 'express'
const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const abi = JSON.parse(
  await readFile(new URL('../contracts/abi.json', import.meta.url))
);

// continue with the rest of your code

const rpcUrl = contractConfig.rpcUrl;
const address = contractConfig.address;



// Create provider
const getProvider = () => {
  return new ethers.JsonRpcProvider(rpcUrl);
};

// Get read-only contract instance
const getContract = () => {
  const provider = getProvider();
  return new ethers.Contract(address, abi, provider);
};

// Get contract with signer for transactions
const getSignedContract = () => {
  const provider = getProvider();
  const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
  return new ethers.Contract(address, abi, wallet);
};

// Service to interact with the blockchain
const blockchainService = {
  /**
   * Get project details
   * @param {number} projectId - Project ID
   * @returns {Promise<Object>} - Project details
   */
  getProject: async (projectId) => {
    try {
      const contract = getContract();
      const projectData = await contract.getProject(projectId);
      
      // Format the response
      return {
        client: projectData[0],
        freelancer: projectData[1],
        amount: ethers.formatEther(projectData[2]),
        isCompleted: projectData[3],
        isFunded: projectData[4],
        isPaid: projectData[5],
        isDisputed: projectData[6],
        description: projectData[7],
        completionPercentage: projectData[8]
      };
    } catch (error) {
      console.error('Error getting project:', error);
      throw new Error(`Failed to fetch project: ${error.message}`);
    }
  },

  /**
   * Get the total number of projects
   * @returns {Promise<number>} - Number of projects
   */
  getProjectsCount: async () => {
    try {
      const contract = getContract();
      // In your contract, you need to expose projectIdCounter or add a function to get it
      const count = await contract.projectIdCounter();
      return count;
    } catch (error) {
      console.error('Error getting projects count:', error);
      throw new Error(`Failed to fetch projects count: ${error.message}`);
    }
  },

  /**
 * Create a new project
 * @param {string} clientAddress - Client wallet address
 * @param {string} freelancerAddress - Freelancer wallet address
 * @param {string} description - Project description
 * @returns {Promise<Object>} - Transaction result
 */
createProject: async (clientAddress, freelancerAddress, description) => {
  try {
    const contract = getSignedContract();
    const tx = await contract.createProject(freelancerAddress, description);
    const receipt = await tx.wait();
    
    // Method 1: Try to find the event directly through receipt events
    // Some providers and ethers versions support this pattern
    if (receipt.events) {
      const projectCreatedEvent = receipt.events.find(
        event => event.event === 'ProjectCreated'
      );
      
      if (projectCreatedEvent && projectCreatedEvent.args) {
        return {
          transactionHash: receipt.hash,
          projectId: projectCreatedEvent.args[0].toString()
        };
      }
    }
    
    // Method 2: Parse logs manually
    // This is a more reliable method that works across different providers
    for (const log of receipt.logs) {
      // Check if this log has the correct event signature
      if (log.topics && log.topics[0] === ethers.id('ProjectCreated(uint256,address,address,uint256,string)')) {
        try {
          const parsedLog = contract.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          
          if (parsedLog && parsedLog.args) {
            return {
              transactionHash: receipt.hash,
              projectId: parsedLog.args[0].toString()
            };
          }
        } catch (parseError) {
          console.error('Error parsing log:', parseError);
          // Continue to the next log if parsing fails
        }
      }
    }

    // Method 3: If we can't get the ID from the event, query the contract
    console.warn('Could not find project ID from event, trying to get the last project ID');
    const projectIdCounter = await contract.projectIdCounter();
    
    return {
      transactionHash: receipt.hash,
      projectId: (projectIdCounter - 1).toString(), // The last created project ID
      note: "ProjectId extracted by querying projectIdCounter"
    };
    
  } catch (error) {
    console.error('Error creating project:', error);
    throw new Error(`Failed to create project: ${error.message}`);
  }
},

  /**
   * Fund a project
   * @param {number} projectId - Project ID
   * @param {string} amount - Amount to fund in ETH
   * @returns {Promise<Object>} - Transaction result
   */
  fundProject: async (projectId, amount) => {
    try {
      const contract = getSignedContract();
      // Convert ETH to Wei
      const amountInWei = ethers.parseEther(amount.toString());
      
      const tx = await contract.fundProject(projectId, { value: amountInWei });
      const receipt = await tx.wait();
      
      return {
        transactionHash: receipt.hash,
        amount: amount
      };
    } catch (error) {
      console.error('Error funding project:', error);
      throw new Error(`Failed to fund project: ${error.message}`);
    }
  },

  /**
   * Update completion percentage
   * @param {number} projectId - Project ID
   * @param {number} percentage - Completion percentage (0-100)
   * @returns {Promise<Object>} - Transaction result
   */
  updateCompletionPercentage: async (projectId, percentage) => {
    try {
      const contract = getSignedContract();
      const tx = await contract.updateCompletionPercentage(projectId, percentage);
      const receipt = await tx.wait();
      
      return {
        transactionHash: receipt.hash,
        percentage: percentage
      };
    } catch (error) {
      console.error('Error updating completion percentage:', error);
      throw new Error(`Failed to update completion percentage: ${error.message}`);
    }
  },

  /**
   * Mark project as completed
   * @param {number} projectId - Project ID
   * @returns {Promise<Object>} - Transaction result
   */
  markProjectCompleted: async (projectId) => {
    try {
      const contract = getSignedContract();
      const tx = await contract.markProjectCompleted(projectId);
      const receipt = await tx.wait();
      
      return {
        transactionHash: receipt.hash
      };
    } catch (error) {
      console.error('Error marking project as completed:', error);
      throw new Error(`Failed to mark project as completed: ${error.message}`);
    }
  },

  /**
   * Release payment to freelancer
   * @param {number} projectId - Project ID
   * @returns {Promise<Object>} - Transaction result
   */
  releasePayment: async (projectId) => {
    try {
      const contract = getSignedContract();
      const tx = await contract.releasePayment(projectId);
      const receipt = await tx.wait();
      
      return {
        transactionHash: receipt.hash
      };
    } catch (error) {
      console.error('Error releasing payment:', error);
      throw new Error(`Failed to release payment: ${error.message}`);
    }
  },

  /**
   * Raise a dispute for a project
   * @param {number} projectId - Project ID
   * @returns {Promise<Object>} - Transaction result
   */
  raiseDispute: async (projectId) => {
    try {
      const contract = getSignedContract();
      const tx = await contract.raiseDispute(projectId);
      const receipt = await tx.wait();
      
      return {
        transactionHash: receipt.hash
      };
    } catch (error) {
      console.error('Error raising dispute:', error);
      throw new Error(`Failed to raise dispute: ${error.message}`);
    }
  },

/**
   * Resolve dispute by percentage
   * @param {number} projectId - Project ID
   * @returns {Promise<Object>} - Transaction result
   */
resolveDisputeByPercentage: async (projectId) => {
    try {
      const contract = getSignedContract();
      const tx = await contract.resolveDisputeByPercentage(projectId);
      const receipt = await tx.wait();
      
      return {
        transactionHash: receipt.hash
      };
    } catch (error) {
      console.error('Error resolving dispute:', error);
      throw new Error(`Failed to resolve dispute: ${error.message}`);
    }
  }
};

export const getProject = blockchainService.getProject;
export const getProjectsCount = blockchainService.getProjectsCount;
export const createProject = blockchainService.createProject;
export const fundProject = blockchainService.fundProject;
export const updateCompletionPercentage = blockchainService.updateCompletionPercentage;
export const markProjectCompleted = blockchainService.markProjectCompleted;
export const releasePayment = blockchainService.releasePayment;
export const raiseDispute = blockchainService.raiseDispute;
export const resolveDisputeByPercentage = blockchainService.resolveDisputeByPercentage;

  