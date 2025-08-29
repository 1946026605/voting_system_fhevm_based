import { ethers } from "ethers";

// Proposal information structure
export interface ProposalInfo {
  id: ethers.BigNumberish;
  title: string;
  description: string;
  startTime: ethers.BigNumberish;
  endTime: ethers.BigNumberish;
  isActive: boolean;
  isPublic: boolean;
  publicYesCount: ethers.BigNumberish;
  publicNoCount: ethers.BigNumberish;
}

// Vote option enum
export enum VoteOption {
  Yes = 0,
  No = 1,
}

// Encrypted vote structure
export interface EncryptedVote {
  encryptedVote: string;
  proof: string;
}

// Proposal status
export type ProposalStatus = "pending" | "active" | "ended";

// User vote record
export interface UserVote {
  proposalId: number;
  proposalTitle: string;
  voteOption: VoteOption;
  timestamp: number;
  proposalStatus: ProposalStatus;
}

// Network information
export interface NetworkInfo {
  chainId: number;
  name: string;
  rpcUrls: string[];
  defaultRpcUrl: string;
  explorer: string;
  currency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

// Wallet connection state
export interface WalletState {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

// FHE context state
export interface FHEState {
  isInitialized: boolean;
  isSepolia: boolean;
  fhevmInstance: any | null;
}

// Contract service interface
export interface ContractService {
  getProposalCount(): Promise<number>;
  getAllProposals(): Promise<ProposalInfo[]>;
  getProposalInfo(proposalId: number): Promise<ProposalInfo>;
  hasVoted(proposalId: number, voter: string): Promise<boolean>;
  isProposalActive(proposalId: number): Promise<boolean>;
  createProposal(title: string, description: string, startTime: number, endTime: number): Promise<ethers.ContractTransactionResponse>;
  vote(proposalId: number, encryptedVote: string, proof: string): Promise<ethers.ContractTransactionResponse>;
  endProposal(proposalId: number): Promise<ethers.ContractTransactionResponse>;
  makeVoteCountsPublic(proposalId: number): Promise<ethers.ContractTransactionResponse>;
  getEncryptedVoteCounts(proposalId: number): Promise<[ethers.BigNumberish, ethers.BigNumberish]>;
  getEncryptedVote(proposalId: number, voter: string): Promise<ethers.BigNumberish>;
  isProposalCreator(proposalId: number, user: string): Promise<boolean>;
}
