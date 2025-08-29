import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext";
import { useFHE } from "../contexts/FHEContext";
import { FHEVotingContractService } from "../services/contractService";
import { ProposalInfo } from "../types";
import { formatDistanceToNow } from "date-fns";
import { ethers } from "ethers";
import { Vote, Shield, Clock, Users, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

const VotePage: React.FC = () => {
  const { proposalId } = useParams<{ proposalId: string }>();
  const navigate = useNavigate();
  const { isConnected, account, signer } = useWallet();
  const { isInitialized, encryptVote } = useFHE();

  const [proposal, setProposal] = useState<ProposalInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedOption, setSelectedOption] = useState<"Yes" | "No" | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(true);

  useEffect(() => {
    if (isConnected && isInitialized && proposalId) {
      loadProposal();
    }
  }, [isConnected, isInitialized, proposalId]);

  const loadProposal = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!account || !signer) {
        throw new Error("No wallet account or signer found.");
      }

      const proposalIdNum = parseInt(proposalId!);

      // Create FHE contract service
      const fheContractService = new FHEVotingContractService(signer.provider!, signer);

      // Load real proposal from contract
      const proposalData = await fheContractService.getProposalInfo(proposalIdNum);
      setProposal(proposalData);

      // Check if user has already voted
      const userVoted = await fheContractService.hasVoted(proposalIdNum, account);
      setHasVoted(userVoted);
    } catch (err: any) {
      console.error("Error loading proposal:", err);
      setError("Failed to load proposal. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const getProposalStatus = (proposal: ProposalInfo) => {
    const now = Date.now();

    if (!proposal.isActive) {
      return { status: "ended", label: "Voting Ended", color: "status-ended" };
    }

    if (now < Number(proposal.startTime) * 1000) {
      return { status: "pending", label: "Voting Pending", color: "status-pending" };
    }

    if (now >= Number(proposal.startTime) * 1000 && now <= Number(proposal.endTime) * 1000) {
      return { status: "active", label: "Voting Active", color: "status-active" };
    }

    return { status: "ended", label: "Voting Ended", color: "status-ended" };
  };

  const formatTime = (timestamp: ethers.BigNumberish) => {
    const date = new Date(Number(timestamp) * 1000);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const canVote = (proposal: ProposalInfo) => {
    const now = Date.now();
    return (
      proposal.isActive &&
      now >= Number(proposal.startTime) * 1000 &&
      now <= Number(proposal.endTime) * 1000 &&
      !hasVoted
    );
  };

  const handleVote = async () => {
    if (!selectedOption || !proposal || !account) return;

    try {
      setVoting(true);
      setError(null);

      if (!signer) {
        throw new Error("No wallet signer found. Please reconnect your wallet.");
      }

      // Debug: Log proposal details before voting
      console.log("Debug - Proposal details:", {
        id: proposal.id,
        title: proposal.title,
        isActive: proposal.isActive,
        startTime: Number(proposal.startTime),
        endTime: Number(proposal.endTime),
        currentTime: Math.floor(Date.now() / 1000),
        canVote: canVote(proposal),
        hasVoted: hasVoted,
        account: account,
      });

      // Use FHE for voting
      let tx;
      try {
        // Convert option to number (0 = Yes, 1 = No) for FHE
        const voteOption = selectedOption === "Yes" ? 0 : 1;

        // Encrypt the vote using FHE
        console.log("Encrypting vote with FHE:", voteOption);
        const { encryptedVote, proof } = await encryptVote(voteOption);
        console.log("Encrypted vote:", encryptedVote);
        console.log("Proof:", proof);

        // Create FHE contract service and submit vote
        const fheContractService = new FHEVotingContractService(signer.provider!, signer);
        console.log("Submitting FHE vote to contract...");
        tx = await fheContractService.vote(Number(proposal.id), encryptedVote, proof);
        console.log("FHE vote transaction submitted:", tx.hash);
      } catch (fheError: any) {
        console.log("FHE voting failed:", fheError.message);
        throw fheError; // Re-throw to be handled by the caller
      }

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log("Vote transaction confirmed:", receipt?.hash);

      setSuccess(true);
      setHasVoted(true);

      // Redirect to proposals page after a short delay
      setTimeout(() => {
        navigate("/proposals");
      }, 3000);
    } catch (err: any) {
      console.error("Error casting vote:", err);

      // Handle specific contract errors
      if (err.code === "ACTION_REJECTED") {
        setError("Transaction was rejected by user.");
      } else if (err.code === "INSUFFICIENT_FUNDS") {
        setError("Insufficient funds for gas. Please ensure you have enough Sepolia ETH.");
      } else if (err.message?.includes("execution reverted")) {
        setError("Transaction failed. Please check if you are eligible to vote on this proposal.");
      } else {
        setError(`Failed to cast vote: ${err.message || "Unknown error"}`);
      }
    } finally {
      setVoting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Wallet Not Connected</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to participate in voting.</p>
          <button onClick={() => navigate("/")} className="btn-primary">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Initializing FHE</h2>
          <p className="text-gray-600">Setting up Full Homomorphic Encryption for secure voting...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading proposal...</p>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Proposal Not Found</h2>
          <p className="text-gray-600 mb-6">The proposal you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate("/proposals")} className="btn-primary">
            Back to Proposals
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <CheckCircle className="w-16 h-16 text-success-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Vote Cast Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your encrypted vote has been recorded on the blockchain. Thank you for participating!
          </p>
          <div className="animate-pulse text-sm text-gray-500">Redirecting to proposals page...</div>
        </div>
      </div>
    );
  }

  const status = getProposalStatus(proposal);
  const canUserVote = proposal ? canVote(proposal) : false;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/proposals")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Proposals</span>
        </button>
      </div>

      {/* Proposal Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{proposal.title}</h1>
          <span className={`status-badge ${status.color}`}>{status.label}</span>
        </div>

        <p className="text-gray-600 mb-6">{proposal.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Started {formatTime(proposal.startTime)}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Ends {formatTime(proposal.endTime)}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Encrypted votes</span>
          </div>

          <div className="flex items-center space-x-2">
            <Vote className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{hasVoted ? "You voted" : "Not voted"}</span>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      {showPrivacyNotice && (
        <div className="card bg-primary-50 border-primary-200 mb-6">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-primary-900 mb-1">Your Vote is Completely Private</h4>
              <p className="text-sm text-primary-800 mb-3">
                Using Full Homomorphic Encryption (FHE), your vote will be encrypted before being sent to the
                blockchain. No one, including the contract owner or other voters, can see how you voted. Only the final
                encrypted tallies are visible, which are then decrypted to reveal the results.
              </p>
              <button
                onClick={() => setShowPrivacyNotice(false)}
                className="text-sm text-primary-700 hover:text-primary-800 font-medium"
              >
                I understand, hide this notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-error-600" />
            <span className="text-error-800">{error}</span>
          </div>
        </div>
      )}

      {/* Voting Interface */}
      {canUserVote ? (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Cast Your Vote</h2>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Select your preferred option. Your choice will be encrypted and recorded on the blockchain.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedOption("Yes")}
                className={`p-6 border-2 rounded-lg text-center transition-all ${
                  selectedOption === "Yes"
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                }`}
              >
                <div className="text-2xl font-bold mb-2">Yes</div>
                <div className="text-sm text-gray-600">Support the proposal as described</div>
              </button>

              <button
                onClick={() => setSelectedOption("No")}
                className={`p-6 border-2 rounded-lg text-center transition-all ${
                  selectedOption === "No"
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                }`}
              >
                <div className="text-2xl font-bold mb-2">No</div>
                <div className="text-sm text-gray-600">Oppose the proposal as described</div>
              </button>
            </div>
          </div>

          <button
            onClick={handleVote}
            disabled={!selectedOption || voting}
            className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {voting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Encrypting and Submitting Vote...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Cast Encrypted Vote</span>
              </div>
            )}
          </button>
        </div>
      ) : hasVoted ? (
        <div className="card text-center">
          <CheckCircle className="w-16 h-16 text-success-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You've Already Voted</h2>
          <p className="text-gray-600 mb-6">
            You have already cast your vote on this proposal. Thank you for participating!
          </p>
          <button onClick={() => navigate("/proposals")} className="btn-primary">
            Back to Proposals
          </button>
        </div>
      ) : status.status === "ended" ? (
        <div className="card text-center">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Voting Has Ended</h2>
          <p className="text-gray-600 mb-6">
            The voting period for this proposal has ended. You can view the results on the proposals page.
          </p>
          <button onClick={() => navigate("/proposals")} className="btn-primary">
            View Results
          </button>
        </div>
      ) : status.status === "pending" ? (
        <div className="card text-center">
          <Clock className="w-16 h-16 text-warning-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Voting Hasn't Started Yet</h2>
          <p className="text-gray-600 mb-6">Voting for this proposal will begin {formatTime(proposal.startTime)}.</p>
          <button onClick={() => navigate("/proposals")} className="btn-primary">
            Back to Proposals
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default VotePage;
