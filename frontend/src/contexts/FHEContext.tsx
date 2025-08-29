import React, { createContext, useContext, useState, useEffect } from "react";
import { CONTRACTS } from "../config/contracts";

// FHE context interface
interface FHEContextType {
  isInitialized: boolean;
  isSepolia: boolean;
  fhevmInstance: any | null;
  encryptVote: (vote: number) => Promise<{ encryptedVote: string; proof: string }>;
  createEncryptedInput: (contractAddress: string, userAddress: string) => any;
}

const FHEContext = createContext<FHEContextType | undefined>(undefined);

export const useFHE = () => {
  const context = useContext(FHEContext);
  if (!context) {
    throw new Error("useFHE must be used within an FHEProvider");
  }
  return context;
};

interface FHEProviderProps {
  children: React.ReactNode;
}

export const FHEProvider: React.FC<FHEProviderProps> = ({ children }) => {
  const [fhevmInstance, setFhevmInstance] = useState<any | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSepolia, setIsSepolia] = useState(false);

  useEffect(() => {
    // Initialize FHEVM instance
    const initializeFHE = async () => {
      try {
        // Check if we're on Sepolia network
        let detectedSepolia = false;
        if (typeof window !== "undefined" && window.ethereum) {
          try {
            const chainId = await window.ethereum.request({ method: "eth_chainId" });
            detectedSepolia = chainId === "0xaa36a7"; // Sepolia chainId
            console.log(`Detected network: ${detectedSepolia ? "Sepolia" : "Other"}`);
          } catch (error) {
            console.log("Could not detect network, using mock FHE");
          }
        }

        setIsSepolia(detectedSepolia);

        if (detectedSepolia) {
          console.log("Using Sepolia network with enhanced mock FHE implementation");

          // For now, use enhanced mock implementation on Sepolia
          // Real FHE infrastructure contracts are not yet deployed on Sepolia
          const enhancedMockFHE = {
            createEncryptedInput: (contractAddress: string, userAddress: string) => ({
              add32: (value: number) => ({
                encrypt: () => {
                  // Generate enhanced mock data that looks more realistic
                  const timestamp = Date.now();
                  const randomBytes = Math.floor(Math.random() * 1000000);
                  const chainId = 11155111; // Sepolia

                  // Create a more realistic FHE handle format for Sepolia
                  const encryptedValue = `0x${chainId.toString(16).padStart(8, "0")}${value.toString(16).padStart(8, "0")}${timestamp.toString(16).padStart(16, "0")}${randomBytes.toString(16).padStart(32, "0")}`;
                  const proof = `0x${timestamp.toString(16).padStart(16, "0")}${randomBytes.toString(16).padStart(16, "0")}${value.toString(16).padStart(8, "0")}${chainId.toString(16).padStart(8, "0")}`;

                  return {
                    handles: [encryptedValue],
                    inputProof: proof,
                  };
                },
              }),
            }),
            userDecryptEuint: async (type: string, encryptedValue: string) => {
              // Enhanced mock decryption for Sepolia
              const hexValue = encryptedValue.slice(2);
              const valuePart = hexValue.slice(8, 16); // Extract value part
              return parseInt(valuePart, 16);
            },
          };

          setFhevmInstance(enhancedMockFHE);
          setIsInitialized(true);
          console.log("Enhanced mock FHE initialized for Sepolia network");

          // Note: Real FHE will be available when infrastructure contracts are deployed
          console.log("Note: Real FHE infrastructure not yet available on Sepolia");
        } else {
          console.log("Using mock FHE implementation");
          // Fallback to mock implementation
          const mockFHE = {
            createEncryptedInput: (contractAddress: string, userAddress: string) => ({
              add32: (value: number) => ({
                encrypt: () => {
                  // Generate FHE-compatible mock data
                  const timestamp = Date.now();
                  const randomBytes = Math.floor(Math.random() * 1000000);

                  // Create a more realistic FHE handle format
                  const encryptedValue = `0x${value.toString(16).padStart(64, "0")}`;
                  const proof = `0x${timestamp.toString(16).padStart(64, "0")}${randomBytes.toString(16).padStart(64, "0")}`;

                  return {
                    handles: [encryptedValue],
                    inputProof: proof,
                  };
                },
              }),
            }),
            userDecryptEuint: async (type: string, encryptedValue: string) => {
              // Mock decryption - extract the original value from mock data
              const hexValue = encryptedValue.slice(2); // Remove 0x prefix
              const last32Chars = hexValue.slice(-32);
              return parseInt(last32Chars, 16) % 1000000; // Extract original value
            },
          };

          setFhevmInstance(mockFHE);
          setIsInitialized(true);
          console.log("FHE context initialized with mock implementation");
        }
      } catch (error) {
        console.error("Failed to initialize FHE context:", error);
      }
    };

    initializeFHE();
  }, []);

  const encryptVote = async (vote: number): Promise<{ encryptedVote: string; proof: string }> => {
    if (!fhevmInstance) {
      throw new Error("FHE context not initialized");
    }

    try {
      // Create encrypted input for the FHE voting contract
      const encryptedInput = await fhevmInstance
        .createEncryptedInput(CONTRACTS.FHE_VOTING, "0x0000000000000000000000000000000000000000")
        .add32(vote)
        .encrypt();

      return {
        encryptedVote: encryptedInput.handles[0],
        proof: encryptedInput.inputProof,
      };
    } catch (error) {
      console.error("Error encrypting vote:", error);
      throw error;
    }
  };

  const createEncryptedInput = (contractAddress: string, userAddress: string) => {
    if (!fhevmInstance) {
      throw new Error("FHE context not initialized");
    }
    return fhevmInstance.createEncryptedInput(contractAddress, userAddress);
  };

  const value: FHEContextType = {
    isInitialized,
    isSepolia,
    fhevmInstance,
    encryptVote,
    createEncryptedInput,
  };

  return <FHEContext.Provider value={value}>{children}</FHEContext.Provider>;
};
