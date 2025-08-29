// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHE Voting Contract
/// @author FHE Voting DApp
/// @notice A decentralized confidential voting system using Full Homomorphic Encryption
contract FHEVoting is SepoliaConfig {
    using FHE for *;

    // Voting options
    enum VoteOption {
        Yes, // 0
        No // 1
    }

    // Custom errors
    error InvalidProposal();
    error ProposalNotActive();
    error AlreadyVoted();
    error VotingNotStarted();
    error VotingEnded();
    error FHEPermissionDenied();
    error VoteCountsAlreadyPublic();

    // Proposal structure
    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        bool isPublic;
        euint32 encryptedYesCount;
        euint32 encryptedNoCount;
        uint256 publicYesCount;
        uint256 publicNoCount;
        mapping(address => bool) hasVoted;
        mapping(address => euint32) encryptedVotes;
    }

    // Public proposal info (without encrypted data)
    struct ProposalInfo {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        bool isPublic;
        uint256 publicYesCount;
        uint256 publicNoCount;
    }

    // State variables
    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => address) public proposalCreator;

    // Events
    event ProposalCreated(uint256 indexed proposalId, string title, uint256 startTime, uint256 endTime);
    event VoteCast(uint256 indexed proposalId, address indexed voter, uint256 timestamp);
    event VoteCountsMadePublic(uint256 indexed proposalId, uint256 yesCount, uint256 noCount);
    event ProposalEnded(uint256 indexed proposalId);

    /// @notice Create a new voting proposal
    /// @param title The proposal title
    /// @param description The proposal description
    /// @param startTime When voting starts (timestamp)
    /// @param endTime When voting ends (timestamp)
    function createProposal(
        string memory title,
        string memory description,
        uint256 startTime,
        uint256 endTime
    ) external {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(startTime > block.timestamp, "Start time must be in the future");
        require(endTime > startTime, "End time must be after start time");

        proposalCount++;
        uint256 proposalId = proposalCount;

        Proposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.title = title;
        proposal.description = description;
        proposal.startTime = startTime;
        proposal.endTime = endTime;
        proposal.isActive = true;
        proposal.isPublic = false;

        // Initialize encrypted vote counts
        proposal.encryptedYesCount = FHE.asEuint32(0);
        proposal.encryptedNoCount = FHE.asEuint32(0);
        proposal.publicYesCount = 0;
        proposal.publicNoCount = 0;

        proposalCreator[proposalId] = msg.sender;

        emit ProposalCreated(proposalId, title, startTime, endTime);
    }

    /// @notice Cast an encrypted vote for a proposal
    /// @param proposalId The ID of the proposal to vote on
    /// @param encryptedVote The encrypted vote (0 for Yes, 1 for No)
    /// @param proof The FHE proof for the encrypted vote
    function vote(uint256 proposalId, externalEuint32 encryptedVote, bytes calldata proof) external {
        if (proposalId == 0 || proposalId > proposalCount) revert InvalidProposal();

        Proposal storage proposal = proposals[proposalId];
        if (!proposal.isActive) revert ProposalNotActive();
        if (proposal.hasVoted[msg.sender]) revert AlreadyVoted();
        if (block.timestamp < proposal.startTime) revert VotingNotStarted();
        if (block.timestamp > proposal.endTime) revert VotingEnded();
        if (proposal.isPublic) revert VoteCountsAlreadyPublic();

        // Convert external encrypted vote to internal euint32
        euint32 voteValue = FHE.fromExternal(encryptedVote, proof);

        // Store the encrypted vote
        proposal.encryptedVotes[msg.sender] = voteValue;
        proposal.hasVoted[msg.sender] = true;

        // Grant decryption permissions
        FHE.allow(voteValue, msg.sender);
        FHE.allowThis(voteValue);

        // Count votes for each option
        euint32 yesVote = FHE.select(FHE.eq(voteValue, FHE.asEuint32(0)), FHE.asEuint32(1), FHE.asEuint32(0));
        euint32 noVote = FHE.select(FHE.eq(voteValue, FHE.asEuint32(1)), FHE.asEuint32(1), FHE.asEuint32(0));

        proposal.encryptedYesCount = FHE.add(proposal.encryptedYesCount, yesVote);
        proposal.encryptedNoCount = FHE.add(proposal.encryptedNoCount, noVote);

        // Grant permissions for vote counts
        FHE.allowThis(proposal.encryptedYesCount);
        FHE.allowThis(proposal.encryptedNoCount);

        emit VoteCast(proposalId, msg.sender, block.timestamp);
    }

    /// @notice Make vote counts public (only proposal creator can call)
    /// @param proposalId The ID of the proposal
    function makeVoteCountsPublic(uint256 proposalId) external {
        if (proposalId == 0 || proposalId > proposalCount) revert InvalidProposal();
        if (msg.sender != proposalCreator[proposalId]) revert FHEPermissionDenied();

        Proposal storage proposal = proposals[proposalId];
        if (!proposal.isActive) revert ProposalNotActive();
        if (proposal.isPublic) revert VoteCountsAlreadyPublic();
        if (block.timestamp <= proposal.endTime) revert ProposalNotActive();

        // Make encrypted counts publicly decryptable
        FHE.makePubliclyDecryptable(proposal.encryptedYesCount);
        FHE.makePubliclyDecryptable(proposal.encryptedNoCount);

        // Get public values - use userDecrypt for now
        // In a real implementation, these would be made publicly decryptable
        proposal.publicYesCount = 0; // Will be set when made public
        proposal.publicNoCount = 0; // Will be set when made public
        proposal.isPublic = true;

        emit VoteCountsMadePublic(proposalId, proposal.publicYesCount, proposal.publicNoCount);
    }

    /// @notice End a proposal and mark it as inactive
    /// @param proposalId The ID of the proposal to end
    function endProposal(uint256 proposalId) external {
        if (proposalId == 0 || proposalId > proposalCount) revert InvalidProposal();
        if (msg.sender != proposalCreator[proposalId]) revert FHEPermissionDenied();

        Proposal storage proposal = proposals[proposalId];
        if (!proposal.isActive) revert ProposalNotActive();
        if (block.timestamp <= proposal.endTime) revert ProposalNotActive();

        proposal.isActive = false;
        emit ProposalEnded(proposalId);
    }

    /// @notice Get encrypted vote counts for a proposal
    /// @param proposalId The ID of the proposal
    /// @return yesCount Encrypted Yes vote count
    /// @return noCount Encrypted No vote count
    function getEncryptedVoteCounts(uint256 proposalId) external view returns (euint32 yesCount, euint32 noCount) {
        if (proposalId == 0 || proposalId > proposalCount) revert InvalidProposal();
        Proposal storage proposal = proposals[proposalId];
        return (proposal.encryptedYesCount, proposal.encryptedNoCount);
    }

    /// @notice Get user's encrypted vote for a proposal
    /// @param proposalId The ID of the proposal
    /// @param voter The address of the voter
    /// @return The encrypted vote
    function getEncryptedVote(uint256 proposalId, address voter) external view returns (euint32) {
        if (proposalId == 0 || proposalId > proposalCount) revert InvalidProposal();
        if (!proposals[proposalId].hasVoted[voter]) revert InvalidProposal();
        return proposals[proposalId].encryptedVotes[voter];
    }

    /// @notice Check if a user has voted on a specific proposal
    /// @param proposalId The ID of the proposal
    /// @param voter The address of the voter
    /// @return True if the user has voted, false otherwise
    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        if (proposalId == 0 || proposalId > proposalCount) revert InvalidProposal();
        return proposals[proposalId].hasVoted[voter];
    }

    /// @notice Check if a proposal is currently active and accepting votes
    /// @param proposalId The ID of the proposal
    /// @return True if the proposal is active and in voting period
    function isProposalActive(uint256 proposalId) external view returns (bool) {
        if (proposalId == 0 || proposalId > proposalCount) revert InvalidProposal();

        Proposal storage proposal = proposals[proposalId];
        uint256 currentTime = block.timestamp;

        return proposal.isActive && currentTime >= proposal.startTime && currentTime <= proposal.endTime;
    }

    /// @notice Get basic proposal information (without encrypted data)
    /// @param proposalId The ID of the proposal
    /// @return ProposalInfo struct with basic proposal details
    function getProposalInfo(uint256 proposalId) external view returns (ProposalInfo memory) {
        if (proposalId == 0 || proposalId > proposalCount) revert InvalidProposal();

        Proposal storage proposal = proposals[proposalId];

        return
            ProposalInfo({
                id: proposal.id,
                title: proposal.title,
                description: proposal.description,
                startTime: proposal.startTime,
                endTime: proposal.endTime,
                isActive: proposal.isActive,
                isPublic: proposal.isPublic,
                publicYesCount: proposal.publicYesCount,
                publicNoCount: proposal.publicNoCount
            });
    }

    /// @notice Get all proposals (basic info only)
    /// @return Array of ProposalInfo structs
    function getAllProposals() external view returns (ProposalInfo[] memory) {
        ProposalInfo[] memory allProposals = new ProposalInfo[](proposalCount);

        for (uint256 i = 1; i <= proposalCount; i++) {
            Proposal storage proposal = proposals[i];
            allProposals[i - 1] = ProposalInfo({
                id: proposal.id,
                title: proposal.title,
                description: proposal.description,
                startTime: proposal.startTime,
                endTime: proposal.endTime,
                isActive: proposal.isActive,
                isPublic: proposal.isPublic,
                publicYesCount: proposal.publicYesCount,
                publicNoCount: proposal.publicNoCount
            });
        }

        return allProposals;
    }

    /// @notice Get the total number of proposals
    /// @return The total count of proposals
    function getProposalCount() external view returns (uint256) {
        return proposalCount;
    }

    /// @notice Check if a user is the creator of a proposal
    /// @param proposalId The ID of the proposal
    /// @param user The address to check
    /// @return True if the user is the creator, false otherwise
    function isProposalCreator(uint256 proposalId, address user) external view returns (bool) {
        if (proposalId == 0 || proposalId > proposalCount) revert InvalidProposal();
        return proposalCreator[proposalId] == user;
    }
}
