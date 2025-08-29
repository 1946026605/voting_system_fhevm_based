# FHE Voting DApp - Decentralized Confidential Voting System

A decentralized voting application built with **Solidity** and **Full Homomorphic Encryption (FHE)** using the **FHEVM
framework** and **React**. This DApp enables truly private and secure voting while maintaining transparency and
preventing fraud.

## 🚀 Live Demo & Demo Video

- **🌐 Live Demo** - Coming soon
- **🎥 [Demo Video](https://drive.google.com/file/d/1wLDFFo6vZl1tKCHmy726IvNvM0cO1zDi/view?usp=sharing)** - video
  demonstration of the system

## 🚀 Features

- **🔐 Privacy First**: Votes are encrypted using FHE technology
- **🗳️ Secure Voting**: Blockchain-based voting with encrypted ballots
- **📋 Proposal Management**: Create and manage voting proposals
- **⏰ Time-Limited Voting**: Set specific voting windows
- **📊 Transparent Results**: Verifiable results while maintaining privacy
- **💼 Wallet Integration**: MetaMask support for Ethereum interactions
- **🌐 Multi-Network**: Support for Sepolia testnet and local development

## 🏗️ Architecture

### Smart Contract (`contracts/FHEVoting.sol`)

- **FHE Integration**: Uses `@fhevm/solidity` for encrypted operations
- **Proposal Management**: Create, manage, and track voting proposals
- **Encrypted Voting**: Cast encrypted votes using FHE
- **Result Publication**: Make voting results public after voting ends
- **Access Control**: Secure permission management

### Frontend (`frontend/`)

- **React 18**: Modern React with TypeScript
- **Tailwind CSS**: Beautiful, responsive UI design
- **Ethers.js**: Ethereum blockchain interaction
- **React Router**: Client-side routing
- **Context API**: State management for wallet and FHE

## 🛠️ Technology Stack

### Backend

- **Solidity**: Smart contract development
- **Hardhat**: Ethereum development environment
- **FHEVM**: Full Homomorphic Encryption framework
- **Zama Protocol**: FHE implementation

### Frontend

- **React 18**: User interface framework
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Ethers.js**: Ethereum library
- **Lucide React**: Icon library

## 📦 Installation

### Prerequisites

- Node.js 16+
- npm or yarn
- MetaMask wallet
- Sepolia testnet ETH

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fhevm-hardhat-template
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=your_sepolia_rpc_url_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### 4. Deploy Smart Contract

```bash
# Deploy to Sepolia testnet
npx hardhat run deploy/FHEVoting.ts --network sepolia

# Deploy to local Hardhat network
npx hardhat run deploy/FHEVoting.ts --network localhost
```

### 5. Update Contract Address

Update the contract address in `frontend/src/config/contracts.ts`:

```typescript
export const CONTRACTS = {
  FHE_VOTING: "0x...", // Your deployed contract address
};
```

### 6. Start Frontend

```bash
cd frontend
npm start
```

The DApp will be available at `http://localhost:3000`

## 🔧 Configuration

### Network Configuration

The DApp supports multiple networks:

- **Sepolia Testnet**: Main testing network
- **Local Hardhat**: Development and testing
- **Ethereum Mainnet**: Production deployment

### FHE Configuration

- **Mock Mode**: For development and testing
- **Real FHE**: For production deployment
- **Key Management**: Secure key handling

## 📱 Usage

### 1. Connect Wallet

- Install MetaMask browser extension
- Connect to Sepolia testnet
- Ensure you have test ETH for gas fees

### 2. Create Proposal

- Navigate to "Create Proposal"
- Fill in title, description, and voting window
- Submit transaction to create proposal

### 3. Vote on Proposals

- Browse available proposals
- Select your voting preference (Yes/No)
- Submit encrypted vote using FHE

### 4. View Results

- Check proposal status and results
- View your voting history
- Monitor active proposals

## 🔐 Security Features

### FHE Encryption

- **End-to-End Encryption**: Votes encrypted before submission
- **Zero-Knowledge Proofs**: Verify vote validity without revealing choice
- **On-Chain Privacy**: Encrypted data stored on blockchain

### Smart Contract Security

- **Access Control**: Secure permission management
- **Time Locks**: Prevent premature result publication
- **Reentrancy Protection**: Secure against common attacks

### Privacy Protection

- **Vote Anonymity**: Individual votes remain private
- **Result Transparency**: Final results are verifiable
- **Audit Trail**: Complete voting history maintained

## 🧪 Testing

### Smart Contract Tests

```bash
npx hardhat test
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Integration Tests

```bash
npx hardhat run scripts/test-voting-flow.js --network localhost
```

## 🚀 Deployment

### Sepolia Testnet

```bash
npx hardhat run deploy/FHEVoting.ts --network sepolia
```

### Mainnet (Production)

```bash
npx hardhat run deploy/FHEVoting.ts --network mainnet
```

### Verification

```bash
npx hardhat verify --network sepolia <contract-address>
```

**Built with ❤️ using FHE technology for a more private and secure future**
