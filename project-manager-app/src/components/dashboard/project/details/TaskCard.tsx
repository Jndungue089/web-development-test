import { useRef } from "react";
import { useDrag } from "react-dnd";
import { motion } from "framer-motion";
import { FiAlertTriangle, FiCalendar, FiUser } from "react-icons/fi";
import { Task } from "@/types/project";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onStatusChange: (taskId: string, newStatus: Task["status"]) => void;
}

export default function TaskCard({ task, onClick, onStatusChange }: TaskCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "TASK",
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const dragRef = useRef<HTMLDivElement>(null);
  drag(dragRef);

  const isOverdue = task.dueDate && new Date() > new Date(task.dueDate) && task.status !== "completed";

  return (
    <motion.div
      ref={dragRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onClick={onClick}
      className={`p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer transition ${
        isDragging ? "opacity-50 shadow-lg" : ""
      } ${isOverdue ? "border-l-4 border-l-red-500" : ""}`}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-medium">{task.title}</h4>
        {isOverdue && (
          <span className="flex items-center text-xs text-red-500">
            <FiAlertTriangle className="mr-1" /> Atrasada
          </span>
        )}
      </div>
      {task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>
      )}
      {task.dueDate && (
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
          <FiCalendar className="mr-1" size={12} />
          <span>Prazo: {new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
      )}
      {task.assignedTo && task.assignedTo.length > 0 && (
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
          <FiUser className="mr-1" size={12} />
          <span>{task.assignedTo.length} responsável(is)</span>
        </div>
      )}
    </motion.div>
  );
}