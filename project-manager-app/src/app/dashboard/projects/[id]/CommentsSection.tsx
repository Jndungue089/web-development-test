"use client";
import { useState, useEffect } from "react";
import { FiSend, FiUser, FiClock } from "react-icons/fi";
import { collection, doc, addDoc, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { toast } from "sonner";

type CommentsSectionProps = {
  projectId: string;
  taskId?: string;
  isNewTask?: boolean;
};

type Comment = {
  id: string;
  text: string;
  author: string;
  createdAt: Timestamp;
  feedback?: {
    difficulty: "easy" | "medium" | "hard";
    improvements?: string;
  };
};

export default function CommentsSection({ projectId, taskId, isNewTask }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState({
    difficulty: "medium" as "easy" | "medium" | "hard",
    improvements: ""
  });

  useEffect(() => {
    if (!taskId || isNewTask) return;

    const unsubscribe = onSnapshot(
      collection(db, "projects", projectId, "tasks", taskId, "comments"),
      (snapshot) => {
        const commentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Comment[];
        setComments(commentsData.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
      }
    );

    return () => unsubscribe();
  }, [projectId, taskId, isNewTask]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !taskId) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "projects", projectId, "tasks", taskId, "comments"), {
        text: newComment,
        author: "currentUserId", // Substituir pelo ID do usuário logado
        createdAt: Timestamp.now(),
      });
      setNewComment("");
      toast.success("Comentário adicionado!");
    } catch (error) {
      toast.error("Erro ao adicionar comentário");
      console.error("Error adding comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!taskId) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "projects", projectId, "tasks", taskId, "comments"), {
        text: "Feedback enviado",
        author: "currentUserId", // Substituir pelo ID do usuário logado
        createdAt: Timestamp.now(),
        feedback: {
          difficulty: feedback.difficulty,
          improvements: feedback.improvements
        }
      });
      setFeedback({ difficulty: "medium", improvements: "" });
      setShowFeedbackForm(false);
      toast.success("Feedback enviado!");
    } catch (error) {
      toast.error("Erro ao enviar feedback");
      console.error("Error sending feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isNewTask) {
    return (
      <div className="text-center py-8 text-gray-500">
        Salve a tarefa primeiro para adicionar comentários
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum comentário ainda. Seja o primeiro a comentar!
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                  <FiUser className="text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{comment.author}</span>
                    <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <FiClock className="mr-1" />
                      {comment.createdAt?.toDate().toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{comment.text}</p>
                  
                  {comment.feedback && (
                    <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <div className="text-sm font-medium mb-1">Feedback:</div>
                      <div className="flex items-center text-sm">
                        <span className="mr-2">Dificuldade:</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          comment.feedback.difficulty === "easy" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                            : comment.feedback.difficulty === "medium" 
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                          {comment.feedback.difficulty === "easy" ? "Fácil" : 
                           comment.feedback.difficulty === "medium" ? "Médio" : "Difícil"}
                        </span>
                      </div>
                      {comment.feedback.improvements && (
                        <div className="mt-2 text-sm">
                          <div className="font-medium">Pontos a melhorar:</div>
                          <p>{comment.feedback.improvements}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmitComment} className="space-y-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Adicione um comentário..."
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          rows={3}
        />
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setShowFeedbackForm(!showFeedbackForm)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {showFeedbackForm ? "Cancelar feedback" : "Adicionar feedback"}
          </button>
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-70"
          >
            <FiSend className="mr-2" />
            Enviar
          </button>
        </div>
      </form>

      {showFeedbackForm && (
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <h3 className="font-medium mb-3">Feedback da Tarefa</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nível de Dificuldade</label>
              <select
                value={feedback.difficulty}
                onChange={(e) => setFeedback({...feedback, difficulty: e.target.value as any})}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="easy">Fácil</option>
                <option value="medium">Médio</option>
                <option value="hard">Difícil</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pontos a Melhorar (opcional)</label>
              <textarea
                value={feedback.improvements}
                onChange={(e) => setFeedback({...feedback, improvements: e.target.value})}
                placeholder="O que poderia ser melhorado nesta tarefa?"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                rows={2}
              />
            </div>
            <button
              type="button"
              onClick={handleSubmitFeedback}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-70"
            >
              <FiSend className="mr-2" />
              Enviar Feedback
            </button>
          </div>
        </div>
      )}
    </div>
  );
}