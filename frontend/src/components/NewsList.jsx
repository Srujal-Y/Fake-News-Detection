import React from "react";

export default function NewsList({ items }) {
  return (
    <div style={{ marginTop: 20 }}>
      <h3>🧾 News List</h3>
      {items.length === 0 ? (
        <p>No news found yet.</p>
      ) : (
        items.map((n) => (
          <div key={n.id} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
            <p><b>ID:</b> {n.id}</p>
            <p><b>Hash:</b> {n.hash}</p>
            <p><b>Source:</b> <a href={n.source}>{n.source}</a></p>
            <p><b>Creator:</b> {n.creator}</p>
            <p><b>Created At:</b> {n.createdAt}</p>
            <p><b>Edits:</b> {n.edits}</p>
          </div>
        ))
      )}
    </div>
  );
}
