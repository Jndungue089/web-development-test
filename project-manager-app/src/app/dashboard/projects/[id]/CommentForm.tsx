"use client";
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";

interface CommentFormProps {
  projectId: string;
  taskId: string;
  onCommentAdded: () => void;
}

export default function CommentForm({ projectId, taskId, onCommentAdded }: CommentFormProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Impede o refresh da página
    if (!text.trim()) return;
    
    setLoading(true);
    setError("");

    try {
      await addDoc(collection(db, "projects", projectId, "tasks", taskId, "comments"), {
        text: text.trim(),
        createdAt: serverTimestamp(),
      });
      setText("");
      onCommentAdded(); // Dispara a atualização da lista
    } catch (err) {
      console.error("Error adding comment:", err);
      setError("Erro ao adicionar comentário");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Adicionar comentário..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:bg-blue-400"
          disabled={loading || !text.trim()}
        >
          {loading ? "Enviando..." : "Comentar"}
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </form>
  );
}