import { FiPlus } from "react-icons/fi";
import { Task } from "@/types/project";
import TaskColumn from "./TaskColumn";

interface ProjectTasksProps {
  tasks: Task[];
  setShowTaskModal: (show: boolean) => void;
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: Task["status"]) => void;
}

export default function ProjectTasks({ tasks, setShowTaskModal, onTaskClick, onStatusChange }: ProjectTasksProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold dark:text-white">Tarefas do Projeto</h2>
        <button
          onClick={() => setShowTaskModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <FiPlus size={16} />
          Nova Tarefa
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["pending", "in_progress", "completed"].map((status) => (
          <TaskColumn
            key={status}
            status={status as Task["status"]}
            tasks={tasks.filter((t) => t.status === status)}
            onTaskClick={onTaskClick}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </div>
  );
}