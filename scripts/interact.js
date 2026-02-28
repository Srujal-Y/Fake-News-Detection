const { ethers } = require("hardhat");

async function main() {
  const [owner] = await ethers.getSigners();

  // 👇 Replace with your deployed contract address
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  // Load deployed contract
  const NewsRegistry = await ethers.getContractFactory("NewsRegistry");
  const newsRegistry = NewsRegistry.attach(contractAddress);

  console.log("✅ Connected to NewsRegistry at:", contractAddress);
  console.log("👤 Using account:", owner.address);

  // 📰 1️⃣ Add a news item
  const hash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("Breaking News: Proof of Concept working!")
  );

  console.log("\n📰 Adding news item to blockchain...");
  const tx = await newsRegistry.addNews(hash, "https://example.com/original-article");
  const receipt = await tx.wait();
  console.log("✅ News added successfully!");
  console.log("   ↳ Tx Hash:", receipt.transactionHash);

  // 🔍 2️⃣ Fetch news meta data
  const newsId = 1; // first added news
  console.log("\n🔍 Fetching news metadata for ID:", newsId);

  const newsMeta = await newsRegistry.getNewsMeta(newsId);
  console.log("📰 Current News Hash:", newsMeta[0]);
  console.log("🔗 Source URL:", newsMeta[1]);
  console.log("👤 Creator:", newsMeta[2]);
  console.log("🕒 Created At:", new Date(Number(newsMeta[3]) * 1000).toLocaleString());
  console.log("✏️ Edit Count:", Number(newsMeta[4]));

  // 📜 3️⃣ Edit news (audit trail)
  console.log("\n✏️ Editing the news item...");
  const newHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("Updated News: Blockchain verified successfully!")
  );
  const editTx = await newsRegistry.editNews(newsId, newHash, "Minor correction added");
  await editTx.wait();
  console.log("✅ News edited successfully!");

  // 🧾 4️⃣ Fetch edit history
  const editCount = await newsRegistry.getEditCount(newsId);
  console.log("\n📊 Total Edits:", Number(editCount));

  for (let i = 0; i < editCount; i++) {
    const edit = await newsRegistry.getEdit(newsId, i);
    console.log(`\n🗂️  Edit #${i + 1}`);
    console.log("   🕒 Timestamp:", new Date(Number(edit[0]) * 1000).toLocaleString());
    console.log("   ⛓️ Previous Hash:", edit[1]);
    console.log("   👤 Editor:", edit[2]);
    console.log("   📝 Note:", edit[3]);
  }

  console.log("\n🎉 Demo complete — all functions executed successfully!");
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exitCode = 1;
});
