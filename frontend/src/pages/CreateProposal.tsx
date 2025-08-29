import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext";
import { FHEVotingContractService } from "../services/contractService";
import { Vote, Calendar, Clock, AlertCircle, CheckCircle } from "lucide-react";

const CreateProposal: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected, signer } = useWallet();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Proposal title is required");
      return false;
    }

    if (!formData.description.trim()) {
      setError("Proposal description is required");
      return false;
    }

    if (!formData.startTime) {
      setError("Start time is required");
      return false;
    }

    if (!formData.endTime) {
      setError("End time is required");
      return false;
    }

    const startTime = new Date(formData.startTime).getTime();
    const endTime = new Date(formData.endTime).getTime();
    const now = Date.now();

    if (startTime <= now) {
      setError("Start time must be in the future");
      return false;
    }

    if (endTime <= startTime) {
      setError("End time must be after start time");
      return false;
    }

    if (endTime - startTime < 3600000) {
      // Less than 1 hour
      setError("Voting period must be at least 1 hour");
      return false;
    }

    if (endTime - startTime > 2592000000) {
      // More than 30 days
      setError("Voting period cannot exceed 30 days");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (!signer) {
        throw new Error("No wallet signer found. Please reconnect your wallet.");
      }

      const startTime = Math.floor(new Date(formData.startTime).getTime() / 1000);
      const endTime = Math.floor(new Date(formData.endTime).getTime() / 1000);

      // Create FHE contract service
      const provider = signer.provider!;
      const fheContractService = new FHEVotingContractService(provider, signer);

      // Create proposal on the blockchain
      const tx = await fheContractService.createProposal(formData.title, formData.description, startTime, endTime);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      setTxHash(receipt?.hash || "");

      setSuccess(true);

      // Redirect to proposals page after a short delay
      setTimeout(() => {
        navigate("/proposals");
      }, 3000);
    } catch (err: any) {
      console.error("Error creating proposal:", err);

      // Handle specific contract errors
      if (err.code === "ACTION_REJECTED") {
        setError("Transaction was rejected by user.");
      } else if (err.code === "INSUFFICIENT_FUNDS") {
        setError("Insufficient funds for gas. Please ensure you have enough Sepolia ETH.");
      } else if (err.message?.includes("execution reverted")) {
        setError("Transaction failed. Please check your input and try again.");
      } else {
        setError(`Failed to create proposal: ${err.message || "Unknown error"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getMinStartTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5); // At least 5 minutes from now
    return now.toISOString().slice(0, 16);
  };

  const getMinEndTime = () => {
    if (!formData.startTime) return "";
    const startTime = new Date(formData.startTime);
    startTime.setHours(startTime.getHours() + 1); // At least 1 hour after start
    return startTime.toISOString().slice(0, 16);
  };

  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Wallet Not Connected</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to create new voting proposals.</p>
          <button onClick={() => navigate("/")} className="btn-primary">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Proposal Created!</h2>
          <p className="text-gray-600 mb-6">
            Your voting proposal has been successfully created and is now live on the blockchain.
          </p>
          {txHash && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">Transaction Hash:</p>
              <p className="text-xs font-mono text-blue-600 break-all">{txHash}</p>
            </div>
          )}
          <div className="animate-pulse text-sm text-gray-500">Redirecting to proposals page...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Proposal</h1>
        <p className="text-gray-600">
          Create a new voting proposal for the community. Set the title, description, and voting time window.
        </p>
      </div>

      {/* Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Proposal Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Enter a clear and concise title for your proposal"
              maxLength={100}
              required
            />
            <p className="mt-1 text-sm text-gray-500">{formData.title.length}/100 characters</p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Proposal Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
              className="input-field"
              placeholder="Provide a detailed description of your proposal, including the rationale and expected outcomes"
              maxLength={1000}
              required
            />
            <p className="mt-1 text-sm text-gray-500">{formData.description.length}/1000 characters</p>
          </div>

          {/* Voting Time Window */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Voting Start Time *</span>
                </div>
              </label>
              <input
                type="datetime-local"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                min={getMinStartTime()}
                className="input-field"
                required
              />
              <p className="mt-1 text-sm text-gray-500">When voting will begin (minimum 5 minutes from now)</p>
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Voting End Time *</span>
                </div>
              </label>
              <input
                type="datetime-local"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                min={getMinEndTime()}
                className="input-field"
                required
              />
              <p className="mt-1 text-sm text-gray-500">When voting will end (minimum 1 hour after start)</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Vote className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">Privacy & Security Notice</h4>
                <p className="text-sm text-blue-800">
                  Once created, this proposal will be stored on the blockchain. All votes cast on this proposal will be
                  encrypted using Full Homomorphic Encryption (FHE), ensuring complete privacy while maintaining
                  transparency and preventing fraud.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={() => navigate("/proposals")} className="btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating Proposal...</span>
                </>
              ) : (
                <>
                  <Vote className="w-4 h-4" />
                  <span>Create Proposal</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProposal;
