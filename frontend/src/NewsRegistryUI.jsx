import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NewsRegistry from "./abi/NewsRegistry.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Helper: Shorten Ethereum address
const shortAddress = (addr) => {
  const str = String(addr || "");
  return str.length > 10 ? `${str.slice(0, 6)}...${str.slice(-4)}` : str || "N/A";
};

export default function NewsRegistryUI() {
  const [account, setAccount] = useState(null);
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sourceUrl, setSourceUrl] = useState("");
  const [content, setContent] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [editNote, setEditNote] = useState("");
  const [editContent, setEditContent] = useState("");

  // Connect MetaMask
  async function connectWallet() {
    if (!window.ethereum) {
      toast.error("Please install MetaMask!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      toast.success("Wallet connected!");
    } catch (error) {
      console.error(error);
      toast.error("Connection failed!");
    }
  }

  // Add News
  async function addNews() {
    if (!content.trim() || !sourceUrl.trim()) {
      return toast.warning("Please fill both fields!");
    }

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, NewsRegistry.abi, signer);

      const hash = ethers.keccak256(ethers.toUtf8Bytes(content));
      const tx = await contract.addNews(hash, sourceUrl);
      await tx.wait();

      toast.success("News added successfully!");
      setShowAddModal(false);
      setContent("");
      setSourceUrl("");
      loadNews();
    } catch (error) {
      console.error("Add News Error:", error);
      toast.error("Transaction failed!");
    } finally {
      setLoading(false);
    }
  }

  // Edit News
  async function editNews(newsId) {
    if (!editContent.trim()) {
      return toast.warning("Please enter updated content!");
    }

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, NewsRegistry.abi, signer);

      const newHash = ethers.keccak256(ethers.toUtf8Bytes(editContent));
      const tx = await contract.editNews(newsId, newHash, editNote || "Updated content");
      await tx.wait();

      toast.success("News updated!");
      setShowEditModal(false);
      setEditContent("");
      setEditNote("");
      setSelectedNews(null);
      loadNews();
    } catch (error) {
      console.error("Edit News Error:", error);
      toast.error("Edit failed!");
    } finally {
      setLoading(false);
    }
  }

  // Load All News
  async function loadNews() {
    if (!account) return;

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, NewsRegistry.abi, provider);

      const total = await contract.getTotalNews();
      const totalCount = Number(total);
      const items = [];

      for (let i = 1; i <= totalCount; i++) {
        try {
          const [hash, url, creator, createdAt, editCount] = await contract.getNewsMeta(i);

          items.push({
            id: i,
            hash: hash.toString(),
            url: url.toString(),
            creator: creator.toString(), // Safe string
            createdAt: new Date(Number(createdAt) * 1000).toLocaleString(),
            edits: Number(editCount),
          });
        } catch (err) {
          console.warn(`Failed to load news ID ${i}:`, err);
        }
      }

      setNewsList(items.reverse());
    } catch (error) {
      console.error("Load News Error:", error);
      toast.error("Failed to load news");
    } finally {
      setLoading(false);
    }
  }

  // Close Edit Modal
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditContent("");
    setEditNote("");
    setSelectedNews(null);
  };

  // Load news when account connects
  useEffect(() => {
    if (account) loadNews();
  }, [account]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <ToastContainer theme="dark" />

      <h1 className="text-5xl font-bold text-center mb-8">News Registry</h1>

      {!account ? (
        <button
          onClick={connectWallet}
          className="block mx-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl">News ({newsList.length})</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl"
            >
              Add News
            </button>
          </div>

          {loading && <p className="text-center animate-pulse">Loading...</p>}

          {!loading && newsList.length === 0 && (
            <p className="text-center text-gray-400">No news yet.</p>
          )}

          {!loading && newsList.length > 0 && (
            <div className="overflow-x-auto bg-gray-800 rounded-xl">
              <table className="w-full border border-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="p-3 text-left">#</th>
                    <th className="p-3 text-left">URL</th>
                    <th className="p-3 text-left">Hash</th>
                    <th className="p-3 text-left">Edits</th>
                    <th className="p-3 text-left">Creator</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {newsList.map((n) => (
                    <tr key={n.id} className="border-t border-gray-700 hover:bg-gray-750">
                      <td className="p-3">{n.id}</td>
                      <td className="p-3">
                        <a href={n.url} target="_blank" rel="noopener" className="text-blue-400 hover:underline break-all">
                          {n.url.slice(0, 40)}...
                        </a>
                      </td>
                      <td className="p-3 font-mono text-xs break-all">{n.hash}</td>
                      <td className="p-3 text-center">{n.edits}</td>
                      <td className="p-3 font-mono">{shortAddress(n.creator)}</td>
                      <td className="p-3 text-sm">{n.createdAt}</td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setSelectedNews(n);
                            setEditContent(""); // New content
                            setShowEditModal(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
              <div className="bg-gray-800 p-6 rounded-2xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Add News</h2>
                <input
                  placeholder="Source URL"
                  className="w-full p-3 mb-3 bg-gray-700 rounded text-white"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                />
                <textarea
                  placeholder="News content (for hash)"
                  className="w-full p-3 mb-4 bg-gray-700 rounded h-32 text-white"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    onClick={addNews}
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded font-semibold disabled:opacity-50"
                  >
                    {loading ? "Adding..." : "Add"}
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {showEditModal && selectedNews && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
              <div className="bg-gray-800 p-6 rounded-2xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Edit News #{selectedNews.id}</h2>
                <textarea
                  placeholder="New content"
                  className="w-full p-3 mb-3 bg-gray-700 rounded h-32 text-white"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
                <input
                  placeholder="Edit note (required)"
                  className="w-full p-3 mb-4 bg-gray-700 rounded text-white"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => editNews(selectedNews.id)}
                    disabled={loading}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black py-2 rounded font-bold disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={closeEditModal}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}