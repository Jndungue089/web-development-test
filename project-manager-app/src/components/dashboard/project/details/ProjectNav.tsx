import { FiPieChart, FiList, FiUser, FiClock } from "react-icons/fi";

interface ProjectNavProps {
  activeTab: "overview" | "tasks" | "members" | "timeline" | "pomodoro";
  setActiveTab: (tab: "overview" | "tasks" | "members" | "timeline" | "pomodoro") => void;
  taskCount: number;
  memberCount: number;
}

export default function ProjectNav({ activeTab, setActiveTab, taskCount, memberCount }: ProjectNavProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-4 md:mb-6 overflow-x-auto">
      <nav className="flex space-x-2 md:space-x-8 px-2 md:px-0">
        <button
          onClick={() => setActiveTab("overview")}
          className={`py-3 md:py-4 px-2 md:px-1 border-b-2 font-medium text-xs md:text-sm flex items-center gap-1 md:gap-2 whitespace-nowrap ${
            activeTab === "overview"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <FiPieChart size={14} className="flex-shrink-0" />
          <span>Visão Geral</span>
        </button>
        
        <button
          onClick={() => setActiveTab("tasks")}
          className={`py-3 md:py-4 px-2 md:px-1 border-b-2 font-medium text-xs md:text-sm flex items-center gap-1 md:gap-2 whitespace-nowrap ${
            activeTab === "tasks"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <FiList size={14} className="flex-shrink-0" />
          <span>Tarefas ({taskCount})</span>
        </button>
        
        <button
          onClick={() => setActiveTab("members")}
          className={`py-3 md:py-4 px-2 md:px-1 border-b-2 font-medium text-xs md:text-sm flex items-center gap-1 md:gap-2 whitespace-nowrap ${
            activeTab === "members"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <FiUser size={14} className="flex-shrink-0" />
          <span>Membros ({memberCount})</span>
        </button>
        
        <button
          onClick={() => setActiveTab("timeline")}
          className={`py-3 md:py-4 px-2 md:px-1 border-b-2 font-medium text-xs md:text-sm flex items-center gap-1 md:gap-2 whitespace-nowrap ${
            activeTab === "timeline"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <FiClock size={14} className="flex-shrink-0" />
          <span>Cronograma</span>
        </button>
        
        <button
          onClick={() => setActiveTab("pomodoro")}
          className={`py-3 md:py-4 px-2 md:px-1 border-b-2 font-medium text-xs md:text-sm flex items-center gap-1 md:gap-2 whitespace-nowrap ${
            activeTab === "pomodoro"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <FiClock size={14} className="flex-shrink-0" />
          <span>Pomodoro</span>
        </button>
      </nav>
    </div>
  );
}