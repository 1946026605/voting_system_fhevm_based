import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext";
import { FHEVotingContractService } from "../services/contractService";
import { ProposalInfo } from "../types";
import { ethers } from "ethers";
import { formatDistanceToNow } from "date-fns";
import { Vote, Clock, Users, ArrowRight, History, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

interface VoteRecord {
  proposalId: number;
  proposalTitle: string;
  voteOption: "Yes" | "No";
  timestamp: number;
  proposalStatus: "active" | "ended" | "pending";
  totalVotes: number;
}

const VotingHistory: React.FC = () => {
  const { isConnected, account } = useWallet();
  const [voteHistory, setVoteHistory] = useState<VoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "ended">("all");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isConnected && account) {
      loadVotingHistory();
    }
  }, [isConnected, account]);

  const loadVotingHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!account) {
        throw new Error("No wallet account found.");
      }

      // Create FHE contract service
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const fheContractService = new FHEVotingContractService(provider, signer);

      // Get all proposals from the contract
      const allProposals = await fheContractService.getAllProposals();

      // Filter proposals where the user has voted
      const userVoteHistory: VoteRecord[] = [];

      for (const proposal of allProposals) {
        try {
          // Check if user has voted on this proposal
          const hasVoted = await fheContractService.hasVoted(Number(proposal.id), account);

          if (hasVoted) {
            // Determine proposal status
            const now = Date.now();
            let proposalStatus: "active" | "ended" | "pending";

            if (!proposal.isActive) {
              proposalStatus = "ended";
            } else if (now < Number(proposal.startTime) * 1000) {
              proposalStatus = "pending";
            } else if (now >= Number(proposal.startTime) * 1000 && now <= Number(proposal.endTime) * 1000) {
              proposalStatus = "active";
            } else {
              proposalStatus = "ended";
            }

            // For now, we'll use a placeholder vote option since FHE votes are encrypted
            // In a real implementation, you might store encrypted vote options locally or decrypt them
            const voteOption: "Yes" | "No" = Math.random() > 0.5 ? "Yes" : "No"; // Placeholder

            userVoteHistory.push({
              proposalId: Number(proposal.id),
              proposalTitle: proposal.title,
              voteOption: voteOption,
              timestamp: Number(proposal.startTime) * 1000, // Using start time as placeholder for vote time
              proposalStatus: proposalStatus,
              totalVotes: Number(proposal.publicYesCount) + Number(proposal.publicNoCount),
            });
          }
        } catch (err) {
          console.error(`Error checking vote for proposal ${proposal.id}:`, err);
          // Continue with other proposals
        }
      }

      // Sort by timestamp (most recent first)
      userVoteHistory.sort((a, b) => b.timestamp - a.timestamp);

      setVoteHistory(userVoteHistory);
    } catch (err) {
      console.error("Error loading voting history:", err);
      setError("Failed to load voting history. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const refreshHistory = async () => {
    setRefreshing(true);
    await loadVotingHistory();
    setRefreshing(false);
  };

  const getFilteredHistory = () => {
    if (filter === "all") return voteHistory;
    return voteHistory.filter((vote) => vote.proposalStatus === filter);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "status-active";
      case "ended":
        return "status-ended";
      case "pending":
        return "status-pending";
      default:
        return "status-ended";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Voting Active";
      case "ended":
        return "Voting Ended";
      case "pending":
        return "Voting Pending";
      default:
        return "Unknown";
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const getVoteOptionLabel = (option: "Yes" | "No") => {
    return option === "Yes" ? "Yes (Support)" : "No (Oppose)";
  };

  const getVoteOptionColor = (option: "Yes" | "No") => {
    return option === "Yes" ? "text-green-600" : "text-red-600";
  };

  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Wallet Not Connected</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to view your voting history.</p>
          <Link to="/" className="btn-primary">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const filteredHistory = getFilteredHistory();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Voting History</h1>
        <p className="text-gray-600">
          Review your past voting decisions and track your participation in community proposals.
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{voteHistory.length}</div>
          <div className="text-sm text-gray-600">Total Votes Cast</div>
        </div>

        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {voteHistory.filter((v) => v.voteOption === "Yes").length}
          </div>
          <div className="text-sm text-gray-600">Support Votes</div>
        </div>

        <div className="card text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">
            {voteHistory.filter((v) => v.voteOption === "No").length}
          </div>
          <div className="text-sm text-gray-600">Oppose Votes</div>
        </div>

        <div className="card text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {voteHistory.filter((v) => v.proposalStatus === "active").length}
          </div>
          <div className="text-sm text-gray-600">Active Proposals</div>
        </div>
      </div>

      {/* Filter Controls and Refresh */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All Votes ({voteHistory.length})
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "active" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Active ({voteHistory.filter((v) => v.proposalStatus === "active").length})
          </button>
          <button
            onClick={() => setFilter("ended")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "ended" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Ended ({voteHistory.filter((v) => v.proposalStatus === "ended").length})
          </button>
        </div>

        <button onClick={refreshHistory} disabled={refreshing} className="btn-secondary flex items-center space-x-2">
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your voting history from blockchain...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredHistory.length === 0 && (
        <div className="text-center py-16">
          <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {filter === "all" ? "No Voting History Yet" : `No ${filter} Proposals`}
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === "all"
              ? "You haven't participated in any voting proposals yet. Start by browsing available proposals."
              : `You haven't voted on any ${filter} proposals yet.`}
          </p>
          {filter === "all" && (
            <Link to="/proposals" className="btn-primary">
              Browse Proposals
            </Link>
          )}
        </div>
      )}

      {/* Voting History List */}
      {!loading && filteredHistory.length > 0 && (
        <div className="grid gap-6">
          {filteredHistory.map((vote) => (
            <div key={vote.proposalId} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1 mb-4 lg:mb-0">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">{vote.proposalTitle}</h3>
                    <span className={`status-badge ${getStatusColor(vote.proposalStatus)}`}>
                      {getStatusLabel(vote.proposalStatus)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div className="flex items-center space-x-2">
                      <Vote className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        Your vote:{" "}
                        <span className={`font-medium ${getVoteOptionColor(vote.voteOption)}`}>
                          {getVoteOptionLabel(vote.voteOption)}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Voted {formatTime(vote.timestamp)}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{vote.totalVotes} total votes</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-600">Vote recorded</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <Link
                    to={`/vote/${vote.proposalId}`}
                    className="btn-secondary flex items-center justify-center space-x-2"
                  >
                    <span>{vote.proposalStatus === "ended" ? "View Results" : "View Proposal"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Privacy Notice */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">Your Privacy is Protected</h4>
            <p className="text-sm text-blue-800">
              While this page shows which proposals you've voted on, your actual voting choices remain completely
              private thanks to Full Homomorphic Encryption (FHE). No one can see how you voted on any specific
              proposal. The vote options shown here are placeholders for demonstration purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotingHistory;
