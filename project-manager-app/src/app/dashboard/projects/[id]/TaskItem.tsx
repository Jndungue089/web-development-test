"use client";
import { useState } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";

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
  priority?: 'low' | 'medium' | 'high';
};

export default function TaskItem({ projectId, task, onStatusChange, onDelete }: {
  projectId: string;
  task: Task;
  onStatusChange: () => void;
  onDelete: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [refreshComments, setRefreshComments] = useState(false);

  const handleStatus = async (status: string) => {
    setLoading(true);
    await updateDoc(doc(db, "projects", projectId, "tasks", task.id), { status });
    setLoading(false);
    onStatusChange();
  };

  const handleDelete = async () => {
    if (!confirm("Excluir esta tarefa?")) return;
    setLoading(true);
    await deleteDoc(doc(db, "projects", projectId, "tasks", task.id));
    setLoading(false);
    onDelete();
  };

  return (
    <li className="p-3 bg-white rounded shadow flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-semibold">{task.title}</div>
          <div className="text-sm text-gray-600">{task.description}</div>
          <div className="text-xs text-gray-400">Status: {task.status}</div>
        </div>
        <div className="flex gap-2 items-center">
          <button
            className="text-xs px-2 py-1 rounded bg-green-100 text-green-800 hover:bg-green-200"
            disabled={loading || task.status === 'completed'}
            onClick={() => handleStatus('concluída')}
          >Concluir</button>
          <button
            className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            disabled={loading || task.status === 'in_progress'}
            onClick={() => handleStatus('em progresso')}
          >Em progresso</button>
          <button
            className="text-xs px-2 py-1 rounded bg-red-100 text-red-800 hover:bg-red-200"
            disabled={loading}
            onClick={handleDelete}
          >Excluir</button>
        </div>
      </div>
      <CommentList projectId={projectId} taskId={task.id} refresh={refreshComments} />
      <CommentForm projectId={projectId} taskId={task.id} onCommentAdded={() => setRefreshComments(r => !r)} />
    </li>
  );
}
