import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext";
import { ethers } from "ethers";
import { FHEVotingContractService } from "../services/contractService";
import { ProposalInfo } from "../types";
import { formatDistanceToNow } from "date-fns";
import { Vote, Clock, Users, ArrowRight, Calendar, AlertCircle, RefreshCw } from "lucide-react";

const Proposals: React.FC = () => {
  const { isConnected, account } = useWallet();
  const [proposals, setProposals] = useState<ProposalInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<Set<number>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isConnected) {
      loadProposals();
    }
  }, [isConnected]);

  const loadProposals = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!account) {
        throw new Error("No wallet account found");
      }

      // Create FHE contract service
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const fheContractService = new FHEVotingContractService(provider, signer);

      // Load real proposals from contract
      const proposalsData = await fheContractService.getAllProposals();
      setProposals(proposalsData);

      // Check which proposals the user has voted on
      if (account) {
        const votedProposals = new Set<number>();
        for (const proposal of proposalsData) {
          try {
            const hasVoted = await fheContractService.hasVoted(Number(proposal.id), account);
            if (hasVoted) {
              votedProposals.add(Number(proposal.id));
            }
          } catch (err) {
            console.error(`Error checking if user voted on proposal ${proposal.id}:`, err);
          }
        }
        setUserVotes(votedProposals);
      }
    } catch (err) {
      console.error("Error loading proposals:", err);
      setError("Failed to load proposals. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const refreshProposals = async () => {
    setRefreshing(true);
    await loadProposals();
    setRefreshing(false);
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
      !userVotes.has(Number(proposal.id))
    );
  };

  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Wallet Not Connected</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to view and participate in voting proposals.</p>
          <Link to="/" className="btn-primary">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Voting Proposals</h1>
        <p className="text-gray-600">
          Browse and participate in community voting proposals. Your votes are encrypted using FHE technology.
        </p>
      </div>

      {/* Create Proposal Button */}
      <div className="mb-8">
        <Link to="/create" className="btn-primary inline-flex items-center space-x-2">
          <Vote className="w-4 h-4" />
          <span>Create New Proposal</span>
        </Link>
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

      {/* Refresh Button */}
      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {proposals.length > 0 ? `${proposals.length} proposal(s) found` : "No proposals found"}
        </div>
        <button onClick={refreshProposals} disabled={refreshing} className="btn-secondary flex items-center space-x-2">
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading proposals from blockchain...</p>
        </div>
      )}

      {/* Proposals List */}
      {!loading && proposals.length === 0 && (
        <div className="text-center py-16">
          <Vote className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Proposals Yet</h3>
          <p className="text-gray-600 mb-6">Be the first to create a proposal and start the voting process.</p>
          <Link to="/create" className="btn-primary">
            Create First Proposal
          </Link>
        </div>
      )}

      {/* Proposals Grid */}
      {!loading && proposals.length > 0 && (
        <div className="grid gap-6">
          {proposals.map((proposal) => {
            const status = getProposalStatus(proposal);
            const canUserVote = canVote(proposal);

            return (
              <div key={Number(proposal.id)} className="card hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1 mb-4 lg:mb-0">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">{proposal.title}</h3>
                      <span className={`status-badge ${status.color}`}>{status.label}</span>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">{proposal.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Starts {formatTime(proposal.startTime)}</span>
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
                        <span className="text-gray-600">
                          {userVotes.has(Number(proposal.id)) ? "Voted" : "Not voted"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    {canUserVote && (
                      <Link
                        to={`/vote/${proposal.id}`}
                        className="btn-primary flex items-center justify-center space-x-2"
                      >
                        <Vote className="w-4 h-4" />
                        <span>Vote Now</span>
                      </Link>
                    )}

                    {userVotes.has(Number(proposal.id)) && (
                      <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-center">
                        <span className="text-green-800 text-sm font-medium">✓ You voted on this proposal</span>
                      </div>
                    )}

                    {status.status === "ended" && (
                      <Link
                        to={`/vote/${proposal.id}`}
                        className="btn-secondary flex items-center justify-center space-x-2"
                      >
                        <span>View Results</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Proposals;
