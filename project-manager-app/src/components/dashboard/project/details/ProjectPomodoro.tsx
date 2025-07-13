import dynamic from "next/dynamic";
import { Task } from "@/types/project";
import PomodoroTimer from "@/components/extras/PomodoroTimer";

interface ProjectPomodoroProps {
  projectId: string;
  tasks: Task[];
}

export default function ProjectPomodoro({ projectId, tasks }: ProjectPomodoroProps) {
  const activeTask = (tasks ?? []).find((t) => t.status !== "completed");

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold dark:text-white">Pomodoro Timer</h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <PomodoroTimer
          projectId={projectId}
          taskId={activeTask?.id}
          taskTitle={activeTask?.title}
          tasks={tasks}
        />
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <h3 className="font-medium mb-4 dark:text-white">Como usar o Pomodoro</h3>
        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
          <li>Trabalhe por 15-45 minutos (foco)</li>
          <li>Faça uma pausa curta de 5 minutos</li>
          <li>A cada 4 ciclos, faça uma pausa longa de 15-30 minutos</li>
          <li>O timer salva automaticamente as sessões completadas na tarefa atual</li>
        </ul>
      </div>
    </div>
  );
}