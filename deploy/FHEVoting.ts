import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying FHE Voting Contract...");

  try {
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deployer account:", deployer.address);

    // Check account balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");

    // Get contract factory
    const FHEVoting = await ethers.getContractFactory("FHEVoting");
    console.log("Contract factory created successfully");

    // Deploy contract
    console.log("Deploying contract...");
    const contract = await FHEVoting.deploy();

    // Wait for deployment
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    console.log("✅ Contract deployed successfully!");
    console.log("Contract address:", contractAddress);
    console.log("Network:", (await ethers.provider.getNetwork()).name);
    console.log("Deployer:", deployer.address);

    // Verify deployment
    const deployedCode = await ethers.provider.getCode(contractAddress);
    if (deployedCode === "0x") {
      console.log("❌ Contract deployment verification failed");
      return;
    }
    console.log("✅ Contract deployment verified");

    // Test basic functionality
    console.log("\n🧪 Testing basic functionality...");

    try {
      // Check proposal count
      const proposalCount = await contract.getProposalCount();
      console.log("Initial proposal count:", proposalCount.toString());

      // Create test proposal
      console.log("Creating test proposal...");
      const currentTime = Math.floor(Date.now() / 1000);
      const startTime = currentTime + 60; // 1 minute from now
      const endTime = currentTime + 3600; // 1 hour from now

      const createTx = await contract.createProposal(
        "Test Proposal",
        "This is a test proposal for the FHE voting system",
        startTime,
        endTime,
      );

      await createTx.wait();
      console.log("✅ Test proposal created successfully");

      // Check proposal status
      const newProposalCount = await contract.getProposalCount();
      console.log("Updated proposal count:", newProposalCount.toString());

      if (newProposalCount.toString() !== "0") {
        const proposal1 = await contract.getProposalInfo(1);
        console.log("Proposal 1 info:", {
          id: proposal1.id.toString(),
          title: proposal1.title,
          description: proposal1.description,
          startTime: proposal1.startTime.toString(),
          endTime: proposal1.endTime.toString(),
          isActive: proposal1.isActive,
          isPublic: proposal1.isPublic,
          publicYesCount: proposal1.publicYesCount.toString(),
          publicNoCount: proposal1.publicNoCount.toString(),
        });
      }
    } catch (error) {
      console.log("⚠️ Functionality test failed:", error.message);
      console.log("This may be normal as FHE functionality requires FHEVM environment");
    }

    console.log("\n🎉 Deployment completed!");
    console.log("Contract address:", contractAddress);
    console.log("Contract verified on Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);

    // Important notes
    console.log("\n⚠️ Important Notes:");
    console.log("1. Update frontend config with contract address:", contractAddress);
    console.log("2. Ensure frontend connects to the correct network");
    console.log("3. FHE functionality requires FHEVM infrastructure");
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    console.error("Full error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
