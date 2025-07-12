import { FiPlus } from "react-icons/fi";
import { Task } from "@/types/project";
import TaskColumn from "./TaskColumn";

interface ProjectTasksProps {
  tasks: Task[];
  setShowTaskModal: (show: boolean) => void;
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: Task["status"]) => void;
}

// Função para truncar texto
const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

export default function ProjectTasks({ tasks, setShowTaskModal, onTaskClick, onStatusChange }: ProjectTasksProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 px-2 sm:px-0">
        <h2 className="text-lg sm:text-xl font-semibold dark:text-white max-w-[180px] xs:max-w-[220px] sm:max-w-[300px] truncate">
          {truncateText("Tarefas do Projeto", 20)}
        </h2>
        <button
          onClick={() => setShowTaskModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base w-full xs:w-auto justify-center"
        >
          <FiPlus size={14} className="flex-shrink-0" />
          <span>Nova Tarefa</span>
        </button>
      </div>
      
      <div className="overflow-x-auto pb-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 min-w-fit">
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
    </div>
  );
}