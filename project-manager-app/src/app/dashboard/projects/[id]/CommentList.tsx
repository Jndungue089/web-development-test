"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";
import { formatDatePT } from "@/utils/dateUtils";

interface Comment {
  id: string;
  text: string;
  createdAt: any;
  // Adicione outros campos conforme necessário
}

interface CommentListProps {
  projectId: string;
  taskId: string;
  refresh: boolean;
}

export default function CommentList({ projectId, taskId, refresh }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "projects", projectId, "tasks", taskId, "comments"),
      orderBy("createdAt", "asc")
    );

    // Usando onSnapshot para atualizações em tempo real
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const commentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Comment[];
        setComments(commentsData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching comments:", err);
        setError("Erro ao carregar comentários");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [projectId, taskId, refresh]);

  if (loading) return <div className="text-sm text-gray-500 py-2">Carregando comentários...</div>;
  if (error) return <div className="text-sm text-red-500 py-2">{error}</div>;
  if (comments.length === 0) return <div className="text-sm text-gray-500 py-2">Nenhum comentário ainda.</div>;

  return (
    <div className="mt-3 space-y-2">
      {comments.map((comment) => (
        <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-800">{comment.text}</p>
          <p className="text-xs text-gray-500 mt-1">
            {comment.createdAt ? formatDatePT(comment.createdAt) : "Data desconhecida"}
          </p>
        </div>
      ))}
    </div>
  );
}