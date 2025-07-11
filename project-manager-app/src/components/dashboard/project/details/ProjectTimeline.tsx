import { FiCalendar } from "react-icons/fi";
import { Project, Task } from "@/types/project";

interface ProjectTimelineProps {
  project: Project;
  tasks: Task[];
}

export default function ProjectTimeline({ project, tasks }: ProjectTimelineProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold dark:text-white">Cronograma do Projeto</h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium dark:text-white">Datas Importantes</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-3">
              <FiCalendar />
            </div>
            <div>
              <h4 className="font-medium dark:text-white">Início do Projeto</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {project.startDate?.toDate().toLocaleDateString("pt-PT", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mr-3">
              <FiCalendar />
            </div>
            <div>
              <h4 className="font-medium dark:text-white">Prazo Final</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {project.endDate?.toDate().toLocaleDateString("pt-PT", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <h3 className="font-medium mb-4 dark:text-white">Tarefas com Prazo</h3>
        {tasks.filter((t) => t.dueDate).length > 0 ? (
          <div className="space-y-3">
            {tasks
              .filter((t) => t.dueDate)
              .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
              .map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium dark:text-white">{task.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Prazo: {task.dueDate}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      task.status === "completed"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : new Date() > new Date(task.dueDate!)
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                  >
                    {task.status === "completed"
                      ? "Concluída"
                      : new Date() > new Date(task.dueDate!)
                      ? "Atrasada"
                      : "Pendente"}
                  </span>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Nenhuma tarefa com prazo definido</p>
        )}
      </div>
    </div>
  );
}