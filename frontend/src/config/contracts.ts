// Contract configuration for the FHE Voting DApp
export const CONTRACTS = {
  // FHE Voting contract address (will be updated after deployment)
  FHE_VOTING: "0x0000000000000000000000000000000000000000",
};

// Network configuration
export const NETWORKS = {
  SEPOLIA: {
    chainId: 11155111,
    name: "Sepolia Testnet",
    rpcUrls: [
      "https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY", // Replace with your API key
      "https://rpc.sepolia.org",
      "https://rpc2.sepolia.org",
    ],
    defaultRpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY", // Replace with your API key
    explorer: "https://sepolia.etherscan.io",
    currency: {
      name: "Sepolia Ether",
      symbol: "SEP",
      decimals: 18,
    },
  },
  HARDHAT: {
    chainId: 31337,
    name: "Hardhat Network",
    rpcUrls: ["http://localhost:8545"],
    defaultRpcUrl: "http://localhost:8545",
    explorer: "",
    currency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
};

// FHE configuration
export const FHE_CONFIG = {
  // FHE instance configuration
  instanceConfig: {
    // Add any specific FHE configuration here
  },
};

// App configuration
export const APP_CONFIG = {
  name: "FHE Voting DApp",
  description: "Secure blockchain voting using Full Homomorphic Encryption",
  version: "1.0.0",
  supportEmail: "support@example.com",
  githubUrl: "https://github.com/your-repo/fhe-voting-dapp",
};

// Default values
export const DEFAULTS = {
  // Proposal creation defaults
  proposal: {
    minVotingDuration: 3600, // 1 hour in seconds
    maxVotingDuration: 2592000, // 30 days in seconds
    minStartTimeOffset: 300, // 5 minutes in seconds
  },
  // UI defaults
  ui: {
    itemsPerPage: 10,
    autoRefreshInterval: 30000, // 30 seconds
  },
};
