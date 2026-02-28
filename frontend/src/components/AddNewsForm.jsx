import React, { useState } from "react";

export default function AddNewsForm({ onAdd }) {
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content || !url) return alert("Please enter content and URL");
    onAdd(content, url);
    setContent("");
    setUrl("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add News</h3>
      <textarea
        placeholder="News content..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows="3"
        style={{ width: "100%", padding: "8px" }}
      />
      <input
        placeholder="Source URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ width: "100%", padding: "8px", marginTop: "8px" }}
      />
      <button type="submit" style={{ marginTop: "8px" }}>
        ➕ Add
      </button>
    </form>
  );
}
