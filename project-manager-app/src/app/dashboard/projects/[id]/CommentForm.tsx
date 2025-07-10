"use client";
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";

export default function CommentForm({ projectId, taskId, onCommentAdded }: {
  projectId: string;
  taskId: string;
  onCommentAdded: () => void;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await addDoc(collection(db, "projects", projectId, "tasks", taskId, "comments"), {
        text,
        createdAt: serverTimestamp(),
      });
      setText("");
      onCommentAdded();
    } catch (err: any) {
      setError("Erro ao comentar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
      <input
        type="text"
        placeholder="Adicionar comentário..."
        value={text}
        onChange={e => setText(e.target.value)}
        className="flex-1 p-2 border rounded"
        required
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
        Comentar
      </button>
      {error && <div className="text-red-500 text-xs ml-2">{error}</div>}
    </form>
  );
}
