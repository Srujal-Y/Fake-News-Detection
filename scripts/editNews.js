// scripts/editNews.js
import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("✏️ Editing News Entry...");

  // Replace with your deployed contract address
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  // Get signer (first account)
  const [signer] = await ethers.getSigners();
  const NewsRegistry = await ethers.getContractFactory("NewsRegistry");
  const contract = await NewsRegistry.attach(contractAddress);

  // News ID to edit (for example, 1)
  const newsId = 1n;

  // New content hash (keccak256 of new content)
  const newHash = ethers.keccak256(
    ethers.toUtf8Bytes("Updated AI Revolution in 2025")
  );

  const note = "Fixed minor factual update.";

  console.log(`🧾 Editing News ID: ${newsId}`);
  console.log(`🆕 New Hash: ${newHash}`);

  // Send transaction
  const tx = await contract.connect(signer).editNews(newsId, newHash, note);
  await tx.wait();

  console.log("✅ News edited successfully!");

  // Fetch updated metadata
  const [currentHash, sourceUrl, creator, createdAt, editCount] =
    await contract.getNewsMeta(newsId);

  console.log(`
📰 News ID: ${newsId}
🔗 Current Hash: ${currentHash}
🌍 Source URL: ${sourceUrl}
👤 Creator: ${creator}
⏰ Created: ${new Date(Number(createdAt) * 1000).toLocaleString()}
✏️ Total Edits: ${editCount}
`);

  // Fetch the last edit
  if (editCount > 0n) {
    const index = editCount - 1n;
    const [timestamp, previousHash, editor, noteText] = await contract.getEdit(
      newsId,
      index
    );

    console.log(`
🕒 Last Edit:
   - Timestamp: ${new Date(Number(timestamp) * 1000).toLocaleString()}
   - Previous Hash: ${previousHash}
   - Editor: ${editor}
   - Note: ${noteText}
`);
  }
}

main().catch((error) => {
  console.error("❌ Error editing news:", error);
  process.exitCode = 1;
});
