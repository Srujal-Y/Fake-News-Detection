// scripts/getNews.js
import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("🔍 Fetching News Meta...");

  // Replace with your deployed contract address
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  // Get the contract factory and attach it
  const NewsRegistry = await ethers.getContractFactory("NewsRegistry");
  const contract = await NewsRegistry.attach(contractAddress);

  // Fetch total news count
  const totalNews = await contract.getTotalNews();
  console.log(`🧾 Total News Articles: ${totalNews}`);

  // If there’s at least one news entry, fetch its details
  if (totalNews > 0n) {
    for (let i = 1n; i <= totalNews; i++) {
      const [currentHash, sourceUrl, creator, createdAt, editCount] =
        await contract.getNewsMeta(i);

      console.log(`
📰 News ID: ${i}
🔗 Hash: ${currentHash}
🌍 Source: ${sourceUrl}
👤 Creator: ${creator}
⏰ Created At: ${new Date(Number(createdAt) * 1000).toLocaleString()}
✏️ Edit Count: ${editCount}
`);
    }
  } else {
    console.log("⚠️ No news found yet!");
  }
}

main().catch((error) => {
  console.error("❌ Error fetching news meta:", error);
  process.exitCode = 1;
});
