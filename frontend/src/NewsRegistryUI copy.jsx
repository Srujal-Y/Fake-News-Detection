import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import NewsRegistry from './abi/NewsRegistry.json'

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // replace with deployed address

export default function NewsRegistryUI() {
  const [account, setAccount] = useState(null);
  const [newsList, setNewsList] = useState([]);
  const [sourceUrl, setSourceUrl] = useState("");
  const [content, setContent] = useState("");
  const [selectedNews, setSelectedNews] = useState(null);
  const [editNote, setEditNote] = useState("");
  const [editContent, setEditContent] = useState("");

  // 🦊 Connect MetaMask
  async function connectWallet() {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const [addr] = await provider.send("eth_requestAccounts", []);
      setAccount(addr);
    } else {
      alert("Please install MetaMask!");
    }
  }

  // 📜 Add new news entry
  async function addNews() {
    if (!content || !sourceUrl) return alert("Please enter both content & URL");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, NewsRegistry.abi, signer);

    const hash = ethers.keccak256(ethers.toUtf8Bytes(content));
    const tx = await contract.addNews(hash, sourceUrl);
    await tx.wait();
    // alert("✅ News added!");
    loadNews();
  }

  // ✏️ Edit existing news
  async function editNews(newsId) {
    if (!editContent) return alert("Please enter updated content!");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, NewsRegistry.abi, signer);

    const newHash = ethers.keccak256(ethers.toUtf8Bytes(editContent));
    const tx = await contract.editNews(newsId, newHash, editNote || "Updated");
    await tx.wait();
    alert("✅ News edited!");
    loadNews();
    setSelectedNews(null);
  }

  // 🔍 Load all news entries dynamically
  // async function loadNews() {
  //   const provider = new ethers.BrowserProvider(window.ethereum);
  //   const contract = new ethers.Contract(CONTRACT_ADDRESS, NewsRegistry.abi, provider);

  //   let items = [];
  //   let id = 1n;
  //   while (true) {
  //     console.log('11111111111111111',);
  //     try {
  //       const [hash, url, creator, createdAt, editCount] = await contract.getNewsMeta(id);
  //       console.log('hash, url, creator, createdAt, editCount', hash, url, creator, createdAt, editCount);
  //       items.push({
  //         id: Number(id),
  //         hash,
  //         url,
  //         creator,
  //         createdAt: new Date(Number(createdAt) * 1000).toLocaleString(),
  //         edits: Number(editCount),
  //       });
  //       console.log('id', id++);
  //       id++;
  //     } catch (err) {
  //       console.log('err', err);
  //       break;
  //     }
  //   }
  //   setNewsList(items);
  // }

  async function loadNews() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, NewsRegistry.abi, provider);

    const total = await contract.getTotalNews();
    const totalCount = Number(total);
    console.log("📊 Total news entries:", totalCount);

    const items = [];

    for (let i = 1; i <= totalCount; i++) {
      const [hash, url, creator, createdAt, editCount] = await contract.getNewsMeta(i);
      items.push({
        id: i,
        hash,
        url,
        creator,
        createdAt: new Date(Number(createdAt) * 1000).toLocaleString(),
        edits: Number(editCount),
      });
    }
    console.log('items', items);
    setNewsList(items);
  }

  useEffect(() => {
    if (account) loadNews();
  }, [account]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">📰 News Blockchain Registry</h1>

      {!account ? (
        <div className="text-center">
          <button
            onClick={connectWallet}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl"
          >
            🔌 Connect
          </button>
        </div>
      ) : (
        <>
          {/* Add News Form */}
          <div className="bg-white p-4 rounded-xl shadow mb-6">
            <h2 className="font-semibold mb-2">➕ Add News</h2>
            <input
              placeholder="Source URL"
              className="border p-2 rounded w-full mb-2"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
            />
            <textarea
              placeholder="News Content"
              className="border p-2 rounded w-full mb-2"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button
              onClick={addNews}
              className="px-3 py-2 bg-green-600 text-white rounded-xl"
            >
              🧾 Add News
            </button>
          </div>

          {/* News List */}
          <h2 className="font-semibold text-xl mb-2">🧩 All News</h2>
          {newsList.length === 0 ? (
            <p>No news found yet.</p>
          ) : (
            <div className="space-y-4">
              {newsList.map((n) => (
                <div
                  key={n.id}
                  className="bg-white p-4 rounded-xl shadow border border-gray-200"
                >
                  <div className="flex justify-between">
                    <h3 className="font-bold">📰 News #{n.id}</h3>
                    <span className="text-sm text-gray-500">{n.createdAt}</span>
                  </div>
                  <p className="text-gray-700 mt-1">🔗 URL: {n.url}</p>
                  <p className="text-gray-700 mt-1 break-all">
                    📦 Hash: {n.hash}
                  </p>
                  <p className="text-gray-700 mt-1">
                    ✏️ Edits: {n.edits} | 👤 Creator: {n.creator.slice(0, 6)}...
                    {n.creator.slice(-4)}
                  </p>

                  {/* Edit Section */}
                  {selectedNews === n.id ? (
                    <div className="mt-3">
                      <textarea
                        placeholder="Updated Content"
                        className="border p-2 rounded w-full mb-2"
                        rows={2}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      />
                      <input
                        placeholder="Edit note (optional)"
                        className="border p-2 rounded w-full mb-2"
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                      />
                      <button
                        onClick={() => editNews(n.id)}
                        className="px-3 py-2 bg-yellow-500 text-white rounded-xl mr-2"
                      >
                        💾 Save Edit
                      </button>
                      <button
                        onClick={() => setSelectedNews(null)}
                        className="px-3 py-2 bg-gray-300 rounded-xl"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedNews(n.id)}
                      className="mt-3 px-3 py-2 bg-blue-500 text-white rounded-xl"
                    >
                      ✏️ Edit News
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
