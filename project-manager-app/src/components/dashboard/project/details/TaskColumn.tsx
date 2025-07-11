import { useRef } from "react";
import { useDrop } from "react-dnd";
import { motion } from "framer-motion";
import { Task } from "@/types/project";
import TaskCard from "./TaskCard";

interface TaskColumnProps {
  status: Task["status"];
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: Task["status"]) => void;
}

export default function TaskColumn({ status, tasks, onTaskClick, onStatusChange }: TaskColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "TASK",
    drop: (item: { id: string }) => onStatusChange(item.id, status),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const dropRef = useRef<HTMLDivElement>(null);
  drop(dropRef);

  const statusConfig = {
    pending: { title: "Pendente", color: "bg-gray-200 dark:bg-gray-700" },
    in_progress: { title: "Em Progresso", color: "bg-blue-200 dark:bg-blue-900/30" },
    completed: { title: "Concluído", color: "bg-green-200 dark:bg-green-900/30" },
    overdue: { title: "Atrasado", color: "bg-red-200 dark:bg-red-900/30" },
  };

  return (
    <div ref={dropRef} className={`rounded-lg p-4 ${isOver ? "bg-opacity-70" : ""} ${statusConfig[status].color}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">{statusConfig[status].title}</h3>
        <span className="text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded-full">{tasks.length}</span>
      </div>
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center text-gray-500 py-4">Nenhuma tarefa</div>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} onStatusChange={onStatusChange} />
          ))
        )}
      </div>
    </div>
  );
}