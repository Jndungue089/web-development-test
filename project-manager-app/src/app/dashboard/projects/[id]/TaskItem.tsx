"use client";
import { useState } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  // ... outros campos
}

interface TaskItemProps {
  projectId: string;
  task: Task;
  onStatusChange: () => void;
  onDelete: () => void;
}

export default function TaskItem({ projectId, task, onStatusChange, onDelete }: TaskItemProps) {
  const [loading, setLoading] = useState(false);
  const [commentRefreshKey, setCommentRefreshKey] = useState(0);
  const [commentsRefreshed, setCommentsRefreshed] = useState(false);

  const handleStatusChange = async (newStatus: Task['status']) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "projects", projectId, "tasks", task.id), { 
        status: newStatus 
      });
      onStatusChange();
    } catch (error) {
      console.error("Error updating task status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, "projects", projectId, "tasks", task.id));
      onDelete();
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4 border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{task.title}</h3>
          <p className="text-gray-600">{task.description}</p>
          <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
            task.status === 'completed' ? 'bg-green-100 text-green-800' :
            task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {task.status === 'completed' ? 'Concluída' :
             task.status === 'in_progress' ? 'Em progresso' : 'Pendente'}
          </span>
        </div>

        <div className="flex gap-2">
          {task.status !== 'completed' && (
            <button
              onClick={() => handleStatusChange('completed')}
              disabled={loading}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
            >
              Concluir
            </button>
          )}
          {task.status !== 'in_progress' && task.status !== 'completed' && (
            <button
              onClick={() => handleStatusChange('in_progress')}
              disabled={loading}
              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-yellow-300"
            >
              Em progresso
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300"
          >
            Excluir
          </button>
        </div>
      </div>

      <div className="mt-4 border-t pt-4">
        <CommentList 
          projectId={projectId} 
          taskId={task.id} 
          refresh={commentsRefreshed} 
        />
        <CommentForm 
          projectId={projectId} 
          taskId={task.id} 
          onCommentAdded={() => setCommentsRefreshed(!commentsRefreshed)} 
        />
      </div>
    </div>
  );
}