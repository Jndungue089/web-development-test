"use client";
import { useState, useEffect } from "react";
import { FiSend, FiUser, FiClock } from "react-icons/fi";
import { collection, doc, addDoc, onSnapshot, Timestamp, getDoc } from "firebase/firestore";
import { db, auth } from "@/firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "sonner";
import { formatDatePT } from "@/utils/dateUtils";

type CommentsSectionProps = {
  projectId: string;
  taskId?: string;
  isNewTask?: boolean;
};

type Comment = {
  id: string;
  text: string;
  author: string;
  authorEmail: string;
  createdAt: Timestamp;
  feedback?: {
    difficulty: "easy" | "medium" | "hard";
    improvements?: string;
  };
};

export default function CommentsSection({ projectId, taskId, isNewTask }: CommentsSectionProps) {
  const [user] = useAuthState(auth);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState({
    difficulty: "medium" as "easy" | "medium" | "hard",
    improvements: ""
  });

  // Função para carregar comentários
  const loadComments = () => {
    if (!taskId || isNewTask) return;

    const commentsRef = collection(db, "projects", projectId, "tasks", taskId, "comments");
    const unsubscribe = onSnapshot(commentsRef, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(commentsData.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
    });

    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = loadComments();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [projectId, taskId, isNewTask]);

  const createNotification = async (message: string) => {
    try {
      const projectDoc = await getDoc(doc(db, "projects", projectId));
      if (!projectDoc.exists()) return;

      const projectData = projectDoc.data();
      const members = projectData.members || [];
      const owner = projectData.owner;

      const notifications = [...members, owner]
        .filter(email => email !== user?.email)
        .map(async (email) => {
          await addDoc(collection(db, "notifications"), {
            projectId,
            taskId,
            recipientEmail: email,
            message,
            read: false,
            type: "comment",
            createdAt: Timestamp.now(),
          });
        });

      await Promise.all(notifications);
    } catch (error) {
      console.error("Error creating notifications:", error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !taskId || !user) return;

    setLoading(true);
    try {
      // Envia apenas para o Firebase e aguarda resposta
      await addDoc(collection(db, "projects", projectId, "tasks", taskId, "comments"), {
        text: newComment,
        author: user.displayName || user.email || "Usuário anônimo",
        authorEmail: user.email || "",
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
    if (!taskId || !user) return;

    setLoading(true);
    try {
      const feedbackData = {
        text: "Feedback enviado sobre a tarefa",
        author: user.displayName || user.email || "Usuário anônimo",
        authorEmail: user.email,
        createdAt: Timestamp.now(),
        feedback: {
          difficulty: feedback.difficulty,
          improvements: feedback.improvements
        }
      };

      await addDoc(collection(db, "projects", projectId, "tasks", taskId, "comments"), {
        text: "Feedback enviado sobre a tarefa",
        author: user.displayName || user.email || "Usuário anônimo",
        authorEmail: user.email || "",
        createdAt: Timestamp.now(),
        feedback: {
          difficulty: feedback.difficulty,
          improvements: feedback.improvements
        }
      });

      // Atualiza a lista de comentários localmente
      setComments(prev => [{
        id: `temp-${Date.now()}`,
        text: "Feedback enviado sobre a tarefa",
        author: user?.displayName || user?.email || "Usuário anônimo",
        authorEmail: user?.email || "",
        createdAt: Timestamp.now(),
        feedback: {
          difficulty: feedback.difficulty,
          improvements: feedback.improvements
        }
      } as Comment, ...prev]);

      const taskDoc = await getDoc(doc(db, "projects", projectId, "tasks", taskId));
      const taskTitle = taskDoc.exists() ? taskDoc.data().title : "a tarefa";
      const notificationMessage = `${user.displayName || user.email} enviou feedback sobre a tarefa "${taskTitle}"`;

      await createNotification(notificationMessage);

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
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <FiUser className="text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{comment.author}</span>
                    <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <FiClock className="mr-1" />
                      {comment.createdAt ? formatDatePT(comment.createdAt) : "Data desconhecida"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{comment.text}</p>

                  {comment.feedback && (
                    <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <div className="text-sm font-medium mb-1">Feedback:</div>
                      <div className="flex items-center text-sm">
                        <span className="mr-2">Dificuldade:</span>
                        <span className={`px-2 py-1 rounded text-xs ${comment.feedback.difficulty === "easy"
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
                          <p className="whitespace-pre-wrap">{comment.feedback.improvements}</p>
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
        <div className="relative">
          <textarea
            value={newComment}
            onChange={(e) => {
              setNewComment(e.target.value);
              if (e.target.value.length > 500) {
                toast.warning("Comentário muito longo (máx. 500 caracteres)");
              }
            }}
            placeholder="Adicione um comentário..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white pr-12"
            rows={3}
            maxLength={500}
            disabled={loading}
          />
          <span className="absolute bottom-3 right-3 text-xs text-gray-400 dark:text-gray-500">
            {newComment.length}/500
          </span>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowFeedbackForm(!showFeedbackForm)}
              className={`text-sm px-3 py-1 rounded-lg transition ${showFeedbackForm
                ? "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
                : "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                }`}
              disabled={loading}
            >
              {showFeedbackForm ? "Cancelar" : "Feedback"}
            </button>

            <button
              type="button"
              onClick={() => toast.info("Funcionalidade de menções em desenvolvimento")}
              className="text-sm px-3 py-1 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              disabled={loading}
            >
              @Mencionar
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-70 disabled:cursor-not-allowed min-w-[120px] justify-center"
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin">↻</span>
                Enviando...
              </>
            ) : (
              <>
                <FiSend className="flex-shrink-0" />
                Enviar
              </>
            )}
          </button>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          Dica: Use Markdown para <strong>**negrito**</strong> ou <em>*itálico*</em>
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
                onChange={(e) => setFeedback({ ...feedback, difficulty: e.target.value as any })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                disabled={loading}
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
                onChange={(e) => setFeedback({ ...feedback, improvements: e.target.value })}
                placeholder="O que poderia ser melhorado nesta tarefa?"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                rows={2}
                disabled={loading}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSubmitFeedback}
                disabled={loading}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-70"
              >
                <FiSend className="mr-2" />
                Enviar Feedback
              </button>
              <button
                type="button"
                onClick={() => setShowFeedbackForm(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}