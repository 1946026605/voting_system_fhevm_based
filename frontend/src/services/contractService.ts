import { ethers } from "ethers";
import { CONTRACTS } from "../config/contracts";
import { ProposalInfo, ContractService } from "../types";

// FHE Voting Contract ABI
const FHE_VOTING_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "title",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "startTime",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "endTime",
        type: "uint256",
      },
    ],
    name: "ProposalCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "voter",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "VoteCast",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "yesCount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "noCount",
        type: "uint256",
      },
    ],
    name: "VoteCountsMadePublic",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
    ],
    name: "ProposalEnded",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "title",
        type: "string",
      },
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "startTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "endTime",
        type: "uint256",
      },
    ],
    name: "createProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "encryptedVote",
        type: "bytes",
      },
      {
        internalType: "bytes",
        name: "proof",
        type: "bytes",
      },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
    ],
    name: "endProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
    ],
    name: "makeVoteCountsPublic",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
    ],
    name: "getAllProposals",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "title",
            type: "string",
          },
          {
            internalType: "string",
            name: "description",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "startTime",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "endTime",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isActive",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isPublic",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "publicYesCount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "publicNoCount",
            type: "uint256",
          },
        ],
        internalType: "struct FHEVoting.ProposalInfo[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
    ],
    name: "getProposalInfo",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "title",
            type: "string",
          },
          {
            internalType: "string",
            name: "description",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "startTime",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "endTime",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isActive",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isPublic",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "publicYesCount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "publicNoCount",
            type: "uint256",
          },
        ],
        internalType: "struct FHEVoting.ProposalInfo",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "voter",
        type: "address",
      },
    ],
    name: "hasVoted",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
    ],
    name: "isProposalActive",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
    ],
    name: "getEncryptedVoteCounts",
    outputs: [
      {
        internalType: "uint32",
        name: "yesCount",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "noCount",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "voter",
        type: "address",
      },
    ],
    name: "getEncryptedVote",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getProposalCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "isProposalCreator",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export class FHEVotingContractService implements ContractService {
  private contract: ethers.Contract;
  private provider: ethers.JsonRpcApiProvider;
  private signer: ethers.JsonRpcSigner;

  constructor(provider: ethers.JsonRpcApiProvider, signer: ethers.JsonRpcSigner) {
    this.provider = provider;
    this.signer = signer;
    this.contract = new ethers.Contract(CONTRACTS.FHE_VOTING, FHE_VOTING_ABI, signer);
  }

  // Get contract instance
  getContractInstance(): ethers.Contract {
    return this.contract;
  }

  // Get proposal count
  async getProposalCount(): Promise<number> {
    try {
      const count = await this.contract.getProposalCount();
      return Number(count);
    } catch (error) {
      console.error("Error getting proposal count:", error);
      throw error;
    }
  }

  // Get all proposals
  async getAllProposals(): Promise<ProposalInfo[]> {
    try {
      const proposals = await this.contract.getAllProposals();
      return proposals;
    } catch (error) {
      console.error("Error getting all proposals:", error);
      throw error;
    }
  }

  // Get proposal info by ID
  async getProposalInfo(proposalId: number): Promise<ProposalInfo> {
    try {
      const proposal = await this.contract.getProposalInfo(proposalId);
      return proposal;
    } catch (error) {
      console.error("Error getting proposal info:", error);
      throw error;
    }
  }

  // Check if user has voted on a proposal
  async hasVoted(proposalId: number, userAddress: string): Promise<boolean> {
    try {
      const hasVoted = await this.contract.hasVoted(proposalId, userAddress);
      return hasVoted;
    } catch (error) {
      console.error("Error checking if user has voted:", error);
      throw error;
    }
  }

  // Check if proposal is active
  async isProposalActive(proposalId: number): Promise<boolean> {
    try {
      const isActive = await this.contract.isProposalActive(proposalId);
      return isActive;
    } catch (error) {
      console.error("Error checking if proposal is active:", error);
      throw error;
    }
  }

  // Create a new proposal
  async createProposal(
    title: string,
    description: string,
    startTime: number,
    endTime: number,
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      const tx = await this.contract.createProposal(title, description, startTime, endTime);
      return tx;
    } catch (error) {
      console.error("Error creating proposal:", error);
      throw error;
    }
  }

  // Cast an encrypted vote
  async vote(proposalId: number, encryptedVote: string, proof: string): Promise<ethers.ContractTransactionResponse> {
    try {
      const tx = await this.contract.vote(proposalId, encryptedVote, proof);
      return tx;
    } catch (error) {
      console.error("Error casting vote:", error);
      throw error;
    }
  }

  // End a proposal
  async endProposal(proposalId: number): Promise<ethers.ContractTransactionResponse> {
    try {
      const tx = await this.contract.endProposal(proposalId);
      return tx;
    } catch (error) {
      console.error("Error ending proposal:", error);
      throw error;
    }
  }

  // Make vote counts public
  async makeVoteCountsPublic(proposalId: number): Promise<ethers.ContractTransactionResponse> {
    try {
      const tx = await this.contract.makeVoteCountsPublic(proposalId);
      return tx;
    } catch (error) {
      console.error("Error making vote counts public:", error);
      throw error;
    }
  }

  // Get encrypted vote counts
  async getEncryptedVoteCounts(proposalId: number): Promise<[ethers.BigNumberish, ethers.BigNumberish]> {
    try {
      const counts = await this.contract.getEncryptedVoteCounts(proposalId);
      return [counts[0], counts[1]];
    } catch (error) {
      console.error("Error getting encrypted vote counts:", error);
      throw error;
    }
  }

  // Get user's encrypted vote
  async getEncryptedVote(proposalId: number, voter: string): Promise<ethers.BigNumberish> {
    try {
      const vote = await this.contract.getEncryptedVote(proposalId, voter);
      return vote;
    } catch (error) {
      console.error("Error getting encrypted vote:", error);
      throw error;
    }
  }

  // Check if user is proposal creator
  async isProposalCreator(proposalId: number, user: string): Promise<boolean> {
    try {
      const isCreator = await this.contract.isProposalCreator(proposalId, user);
      return isCreator;
    } catch (error) {
      console.error("Error checking if user is proposal creator:", error);
      throw error;
    }
  }

  // Listen to proposal creation events
  onProposalCreated(callback: (proposalId: number, title: string, startTime: number, endTime: number) => void) {
    this.contract.on("ProposalCreated", (proposalId, title, startTime, endTime) => {
      callback(Number(proposalId), title, Number(startTime), Number(endTime));
    });
  }

  // Listen to vote cast events
  onVoteCast(callback: (proposalId: number, voter: string, timestamp: number) => void) {
    this.contract.on("VoteCast", (proposalId, voter, timestamp) => {
      callback(Number(proposalId), voter, Number(timestamp));
    });
  }

  // Remove all event listeners
  removeAllListeners() {
    this.contract.removeAllListeners();
  }
}
