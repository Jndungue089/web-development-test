import { FiPieChart, FiList, FiUser, FiClock } from "react-icons/fi";

interface ProjectNavProps {
  activeTab: "overview" | "tasks" | "members" | "timeline" | "pomodoro";
  setActiveTab: (tab: "overview" | "tasks" | "members" | "timeline" | "pomodoro") => void;
  taskCount: number;
  memberCount: number;
}

export default function ProjectNav({ activeTab, setActiveTab, taskCount, memberCount }: ProjectNavProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav className="flex space-x-8">
        <button
          onClick={() => setActiveTab("overview")}
          className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === "overview"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <FiPieChart size={16} />
          Visão Geral
        </button>
        <button
          onClick={() => setActiveTab("tasks")}
          className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === "tasks"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <FiList size={16} />
          Tarefas ({taskCount})
        </button>
        <button
          onClick={() => setActiveTab("members")}
          className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === "members"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <FiUser size={16} />
          Membros ({memberCount})
        </button>
        <button
          onClick={() => setActiveTab("timeline")}
          className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === "timeline"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <FiClock size={16} />
          Cronograma
        </button>
        <button
          onClick={() => setActiveTab("pomodoro")}
          className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === "pomodoro"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <FiClock size={16} />
          Pomodoro Timer
        </button>
      </nav>
    </div>
  );
}