import { ethers } from "ethers";
import fs from "fs";

// ✅ Localhost network provider (Hardhat node)
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// ✅ Replace this with the private key of the first Hardhat account
const PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // 👈 replace

async function main() {
  console.log("📰 Adding news...");

  // ✅ Load ABI
  const artifactPath = "./artifacts/contracts/NewsRegistry.sol/NewsRegistry.json";
  const artifactJson = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const abi = artifactJson.abi;

  // ✅ Setup wallet
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const newsRegistry = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

  // ✅ Prepare data
  const title = "AI Revolution in 2025";
  const description = "Artificial Intelligence is transforming industries worldwide.";
  const content = `${title} - ${description}`;
  const hash = ethers.keccak256(ethers.toUtf8Bytes(content));

  console.log("📜 Adding hash:", hash);

  // ✅ Call contract
  const tx = await newsRegistry.addNews(hash, "https://example.com/ai-article");
  await tx.wait();

  console.log("✅ News added successfully!");
}

main().catch((error) => {
  console.error("❌ Error adding news:", error);
  process.exitCode = 1;
});
