// config.js
import dotenv from 'dotenv';
dotenv.config();

const contractConfig = {
  address: process.env.CONTRACT_ADDRESS,
  chainId: parseInt(process.env.CHAIN_ID || '11155111'),
  rpcUrl: process.env.RPC_URL
};

export default contractConfig;