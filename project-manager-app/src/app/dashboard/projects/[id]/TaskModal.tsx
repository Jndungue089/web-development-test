"use client";
import { useState, useEffect } from "react";
import { FiX, FiCalendar, FiUser, FiMessageSquare, FiAlertCircle, FiCheck } from "react-icons/fi";
import { doc, setDoc, updateDoc, Timestamp, collection } from "firebase/firestore";
import { db } from "@/firebase/config";
import { toast } from "sonner";
import CommentsSection from "./CommentsSection";
import MemberSelector from "./MemberSelector";

type TaskModalProps = {
  projectId: string;
  task?: any | null;
  allUsers: string[];
  projectMembers: string[];
  onClose: () => void;
};

type Task = {
  id: string;
  title: string;
  description: string;
  notes?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  dueDate?: string;
  completedAt?: string;
  assignedTo?: string[];
  createdAt: Date;
};

export default function TaskModal({ projectId, task, allUsers, projectMembers, onClose }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [notes, setNotes] = useState(task?.notes || "");
  const [dueDate, setDueDate] = useState(task?.dueDate || "");
  const [assignedTo, setAssignedTo] = useState<string[]>(task?.assignedTo || []);
  const [status, setStatus] = useState(task?.status || "pending");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const taskData = {
        title,
        description,
        notes,
        dueDate,
        assignedTo,
        status,
        updatedAt: Timestamp.now(),
      };

      if (task) {
        // Atualizar tarefa existente
        await updateDoc(doc(db, "projects", projectId, "tasks", task.id), taskData);
        toast.success("Tarefa atualizada com sucesso!");
      } else {
        // Criar nova tarefa
        await setDoc(doc(collection(db, "projects", projectId, "tasks")), {
          ...taskData,
          createdAt: Timestamp.now(),
        });
        toast.success("Tarefa criada com sucesso!");
      }

      onClose();
    } catch (error) {
      toast.error("Erro ao salvar tarefa");
      console.error("Error saving task:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-xl font-bold">{task ? "Editar Tarefa" : "Nova Tarefa"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <FiX size={24} />
          </button>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("details")}
            className={`px-4 py-3 font-medium ${activeTab === "details" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 dark:text-gray-400"}`}
          >
            Detalhes
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`px-4 py-3 font-medium ${activeTab === "comments" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 dark:text-gray-400"}`}
          >
            Comentários
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-150px)] p-6">
          {activeTab === "details" ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observações</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={2}
                  placeholder="Adicione informações adicionais..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <FiCalendar className="mr-2" /> Prazo
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <FiUser className="mr-2" /> Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="pending">Pendente</option>
                    <option value="in_progress">Em Progresso</option>
                    <option value="completed">Concluído</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Responsáveis</label>
                <MemberSelector
                  allUsers={allUsers}
                  projectMembers={projectMembers}
                  selectedUsers={assignedTo}
                  onSelect={setAssignedTo}
                />
              </div>
            </div>
          ) : (
            <CommentsSection 
              projectId={projectId} 
              taskId={task?.id} 
              isNewTask={!task}
            />
          )}

          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-70"
            >
              {loading ? (
                <>
                  <FiAlertCircle className="animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <FiCheck className="mr-2" />
                  {task ? "Atualizar Tarefa" : "Criar Tarefa"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}