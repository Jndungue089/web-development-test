"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase/config";

export default function CommentList({ projectId, taskId, refresh }: {
  projectId: string;
  taskId: string;
  refresh: boolean;
}) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchComments() {
      const q = query(collection(db, "projects", projectId, "tasks", taskId, "comments"), orderBy("createdAt", "asc"));
      const snap = await getDocs(q);
      setComments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    fetchComments();
  }, [projectId, taskId, refresh]);

  if (loading) return <div className="text-xs text-gray-400">Carregando comentários...</div>;
  if (comments.length === 0) return <div className="text-xs text-gray-400">Nenhum comentário.</div>;

  return (
    <ul className="mt-2 space-y-1">
      {comments.map(c => (
        <li key={c.id} className="text-sm bg-gray-50 p-2 rounded">
          {c.text}
        </li>
      ))}
    </ul>
  );
}
