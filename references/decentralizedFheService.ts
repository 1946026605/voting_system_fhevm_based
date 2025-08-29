"use client";

import { ethers } from 'ethers';
import { DECENTRALIZED_VOTING_ADDRESS } from './contracts';

// Types for FHE operations
export interface FHEInstance {
  encrypt: (value: number) => Promise<{ encryptedValue: string; proof: string }>;
  decrypt: (encryptedValue: string) => Promise<number>;
  publicDecrypt: (encryptedValue: string) => Promise<number>;
  userDecrypt: (encryptedValue: string) => Promise<number>;
}

export interface FHEConfig {
  network: any;
  rpcUrl?: string;
  chainId?: number;
  account?: string;
}

export interface EncryptedVote {
  encryptedValue: string; // externalEuint32 as bytes32
  proof: string; // bytes
}

// Vote options for multi-option voting
export const VOTE_OPTIONS = {
  OPTION_1: 0,
  OPTION_2: 1,
  OPTION_3: 2,
  OPTION_4: 3,
} as const;

export type VoteOption = typeof VOTE_OPTIONS[keyof typeof VOTE_OPTIONS];

// Zama SDK interface
interface ZamaInstance {
  createEncryptedInput: (contractAddress: string, userAddress: string) => Promise<any>;
  userDecrypt: (handleContractPairs: any[], privateKey: string, publicKey: string, signature: string, contractAddresses: string[], userAddress: string, startTimeStamp: string, durationDays: string) => Promise<Record<string, any>>;
  publicDecrypt: (handles: string[]) => Promise<Record<string, any>>;
  generateKeypair: () => Promise<{ publicKey: string; privateKey: string }>;
  getPublicKey: () => Promise<string>;
  getPublicParams: () => Promise<any>;
  createEIP712: (publicKey: string, contractAddresses: string[], startTimeStamp: string, durationDays: string) => Promise<any>;
}

// Global state for SDK loading
let sdkLoaded = false;
let sdkLoadPromise: Promise<void> | null = null;

// Load Zama SDK from CDN
const loadZamaSDKFromCDN = async (): Promise<void> => {
  if (typeof window === "undefined") {
    throw new Error("Zama SDK can only be loaded on client side");
  }

  if (sdkLoaded) {
    console.log('Zama SDK already loaded');
    return;
  }

  if (sdkLoadPromise) {
    console.log('Zama SDK loading already in progress, waiting...');
    await sdkLoadPromise;
    return;
  }

  console.log('Starting to load Zama SDK from CDN...');
  
  sdkLoadPromise = new Promise<void>((resolve, reject) => {
    // Check if SDK is already loaded
    if ((window as any).initSDK && (window as any).createInstance) {
      console.log('Zama SDK already available in window');
      sdkLoaded = true;
      resolve();
      return;
    }

    // Try CDN first
    const tryCDN = () => {
      const script = document.createElement('script');
      script.src = 'https://cdn.zama.ai/relayer-sdk-js/0.1.0-9/relayer-sdk-js.umd.cjs';
      script.type = 'text/javascript';
      
      script.onload = () => {
        console.log('Zama SDK script loaded from CDN');
        
        // Wait a bit for the script to initialize
        setTimeout(() => {
          console.log('Checking SDK availability after CDN load...');
          console.log('window.initSDK:', typeof (window as any).initSDK);
          console.log('window.createInstance:', typeof (window as any).createInstance);
          
          if ((window as any).initSDK && (window as any).createInstance) {
            console.log('Zama SDK loaded from CDN successfully');
            sdkLoaded = true;
            resolve();
          } else {
            console.log('CDN failed, trying dynamic import...');
            tryDynamicImport();
          }
        }, 1000);
      };
      
      script.onerror = () => {
        console.log('CDN failed, trying dynamic import...');
        tryDynamicImport();
      };
      
      document.head.appendChild(script);
    };

    // Try dynamic import as fallback
    const tryDynamicImport = async () => {
      try {
        console.log('Trying dynamic import...');
        await import('https://cdn.zama.ai/relayer-sdk-js/0.1.0-9/relayer-sdk-js.esm.js');
        console.log('Dynamic import successful');
        sdkLoaded = true;
        resolve();
      } catch (error) {
        console.error('Dynamic import failed:', error);
        reject(new Error('Failed to load Zama SDK'));
      }
    };

    tryCDN();
  });

  await sdkLoadPromise;
};

// Initialize Zama SDK
export const initializeZamaSDK = async (): Promise<void> => {
  try {
    await loadZamaSDKFromCDN();
    console.log('Zama SDK initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Zama SDK:', error);
    throw error;
  }
};

// Create FHE instance
export const createFHEInstance = async (config: FHEConfig): Promise<FHEInstance> => {
  if (!sdkLoaded) {
    await initializeZamaSDK();
  }

  if (!(window as any).createInstance) {
    throw new Error('Zama SDK not available');
  }

  try {
    const instance = await (window as any).createInstance(config);
    console.log('FHE instance created:', instance);
    
    return {
      encrypt: async (value: number) => {
        try {
          const encryptedInput = await instance.createEncryptedInput(
            DECENTRALIZED_VOTING_ADDRESS,
            config.account || ''
          );
          
          // Convert the value to the appropriate format
          const encryptedValue = ethers.utils.hexlify(encryptedInput);
          const proof = "0x"; // Placeholder for proof
          
          return { encryptedValue, proof };
        } catch (error) {
          console.error('Encryption failed:', error);
          throw new Error('Failed to encrypt value');
        }
      },
      
      decrypt: async (encryptedValue: string) => {
        try {
          // This would typically involve the relayer
          const result = await instance.publicDecrypt([encryptedValue]);
          return parseInt(result[encryptedValue] || '0');
        } catch (error) {
          console.error('Decryption failed:', error);
          throw new Error('Failed to decrypt value');
        }
      },
      
      publicDecrypt: async (encryptedValue: string) => {
        try {
          const result = await instance.publicDecrypt([encryptedValue]);
          return parseInt(result[encryptedValue] || '0');
        } catch (error) {
          console.error('Public decryption failed:', error);
          throw new Error('Failed to publicly decrypt value');
        }
      },
      
      userDecrypt: async (encryptedValue: string) => {
        try {
          // This would require user's private key and signature
          throw new Error('User decryption not implemented in this version');
        } catch (error) {
          console.error('User decryption failed:', error);
          throw new Error('Failed to decrypt value for user');
        }
      }
    };
  } catch (error) {
    console.error('Failed to create FHE instance:', error);
    throw new Error('Failed to create FHE instance');
  }
};

// Prepare vote for contract submission
export const prepareVoteForContract = async (
  voteOption: VoteOption,
  fheInstance: FHEInstance
): Promise<EncryptedVote> => {
  try {
    const { encryptedValue, proof } = await fheInstance.encrypt(voteOption);
    
    return {
      encryptedValue,
      proof
    };
  } catch (error) {
    console.error('Failed to prepare vote:', error);
    throw new Error('Failed to prepare vote for contract');
  }
};

// Handle FHE errors
export const handleFHEError = (error: any): string => {
  if (error.code === 'USER_REJECTED') {
    return 'Transaction was rejected by user';
  }
  
  if (error.message?.includes('FHE')) {
    return 'FHE operation failed. Please try again.';
  }
  
  if (error.message?.includes('insufficient funds')) {
    return 'Insufficient funds for transaction';
  }
  
  return error.message || 'An unknown error occurred';
};

// Validate vote option
export const isValidVoteOption = (option: number, maxOptions: number): boolean => {
  return option >= 0 && option < maxOptions;
};

// Format timestamp for display
export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
};

// Check if proposal is active
export const isProposalActive = (startTime: number, endTime: number): boolean => {
  const now = Math.floor(Date.now() / 1000);
  return now >= startTime && now <= endTime;
};

// Check if proposal has ended
export const hasProposalEnded = (endTime: number): boolean => {
  const now = Math.floor(Date.now() / 1000);
  return now > endTime;
};

// Get time remaining for proposal
export const getTimeRemaining = (endTime: number): string => {
  const now = Math.floor(Date.now() / 1000);
  const remaining = endTime - now;
  
  if (remaining <= 0) {
    return 'Voting ended';
  }
  
  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m remaining`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  } else {
    return `${minutes}m remaining`;
  }
};
