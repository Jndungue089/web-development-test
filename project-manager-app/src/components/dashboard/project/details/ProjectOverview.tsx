import ProgressBar from "@/components/ProgressBar";
import { Project, ProjectStats } from "@/types/project";

interface ProjectOverviewProps {
  project: Project;
  stats: ProjectStats;
}

export default function ProjectOverview({ project, stats }: ProjectOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Estatísticas do projeto */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total de Tarefas</h3>
          <p className="text-2xl font-bold dark:text-white">{stats.totalTasks}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Concluídas</h3>
          <p className="text-2xl font-bold dark:text-white">{stats.completedTasks}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Atrasadas</h3>
          <p className="text-2xl font-bold dark:text-white">{stats.overdueTasks}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Prioridade Alta</h3>
          <p className="text-2xl font-bold dark:text-white">{stats.highPriorityTasks}</p>
        </div>
      </div>

      {/* Progresso */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Progresso do Projeto</h2>
        <ProgressBar value={stats.progress} />
        <div className="mt-2 flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>{stats.progress}% completo</span>
          <span>
            {stats.completedTasks} de {stats.totalTasks} tarefas
          </span>
        </div>
      </div>

      {/* Descrição do Projeto */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Descrição do Projeto</h2>
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{project.description}</p>
      </div>
    </div>
  );
}