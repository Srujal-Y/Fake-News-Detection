import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("Deploying NewsRegistry contract...");

  const NewsRegistry = await ethers.getContractFactory("NewsRegistry");
  const newsRegistry = await NewsRegistry.deploy();

  await newsRegistry.waitForDeployment();

  console.log(`Deployed at address: ${await newsRegistry.getAddress()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
