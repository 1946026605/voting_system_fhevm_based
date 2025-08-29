import React from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext";
import { Shield, Vote, Clock, Users, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";

const Home: React.FC = () => {
  const { isConnected, connect, isConnecting } = useWallet();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Development Notice */}
      <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-yellow-900 mb-1">Development Version</h4>
            <p className="text-sm text-yellow-800">
              This is a development version of the FHE Voting DApp with mock FHE functionality. The voting simulation
              works locally but doesn't interact with the actual blockchain or use real FHE encryption. For production
              deployment, the smart contract needs to be deployed and real FHE libraries integrated.
            </p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="text-center py-16">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <Shield className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Secure Voting with
            <span className="text-blue-600"> FHE</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Experience truly private and secure voting using Full Homomorphic Encryption (FHE) on the Ethereum
            blockchain. Your votes remain encrypted while ensuring transparency and preventing fraud.
          </p>

          {!isConnected ? (
            <button
              onClick={connect}
              disabled={isConnecting}
              className="btn-primary text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? "Connecting..." : "Connect Wallet to Start"}
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/proposals" className="btn-primary text-lg px-8 py-4">
                View Proposals
              </Link>
              <Link to="/create" className="btn-secondary text-lg px-8 py-4">
                Create Proposal
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="card text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Privacy First</h3>
          <p className="text-gray-600">
            Your votes are encrypted using FHE, ensuring complete privacy while maintaining the integrity of the voting
            process.
          </p>
        </div>

        <div className="card text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Vote className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Transparent Results</h3>
          <p className="text-gray-600">
            While individual votes remain private, the final results are verifiable and transparent on the blockchain.
          </p>
        </div>

        <div className="card text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Time-Limited Voting</h3>
          <p className="text-gray-600">
            Set specific time windows for voting periods, ensuring fair and organized decision-making processes.
          </p>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">1</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Wallet</h3>
            <p className="text-gray-600 text-sm">Connect your MetaMask wallet to the Sepolia testnet</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">2</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Create or Join</h3>
            <p className="text-gray-600 text-sm">Create new proposals or participate in existing voting sessions</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">3</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Vote Privately</h3>
            <p className="text-gray-600 text-sm">Cast your encrypted vote using FHE technology</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">4</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">View Results</h3>
            <p className="text-gray-600 text-sm">See the final results after the voting period ends</p>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-4">
          <CheckCircle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Security & Privacy</h3>
            <p className="text-blue-800 mb-4">
              This DApp uses Full Homomorphic Encryption (FHE) to ensure your votes remain completely private. Your
              individual voting choices are encrypted on-chain and cannot be viewed by anyone, including the contract
              owner or other voters. Only the final encrypted tallies are visible, which are then decrypted to reveal
              the results.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                End-to-End Encryption
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Zero-Knowledge Proofs
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Blockchain Security
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      {isConnected && (
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Voting?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/proposals" className="btn-primary flex items-center justify-center space-x-2">
              <span>Browse Proposals</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/create" className="btn-secondary flex items-center justify-center space-x-2">
              <span>Create New Proposal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
