import { useRef, useEffect, useState } from "react";
import { useDrag } from "react-dnd";
import Link from "next/link";
import { FiMoreVertical } from "react-icons/fi";

const priorityColors: Record<"low" | "medium" | "high", string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

export type Project = {
  id: string;
  title: string;
  description: string;
  status: "TO_DO" | "IN_PROGRESS" | "DONE";
  createdAt?: Date;
  priority?: "low" | "medium" | "high";
  role?: "Owner" | "Participant";
  isAdmin?: boolean;
};

type MoveProjectFn = (id: string, newStatus: "TO_DO" | "IN_PROGRESS" | "DONE", archive?: boolean, remove?: boolean) => void;


interface ProjectCardBaseProps {
  project: Project;
  moveProject: MoveProjectFn;
}

export default function ProjectCardBase({ project, moveProject }: ProjectCardBaseProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "PROJECT",
    item: { id: project.id, status: project.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
  useEffect(() => {
    if (ref.current) drag(ref.current);
  }, [ref, drag]);

  const isAdmin = !!project.isAdmin;
  const isOwner = project.role === "Owner";
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  return (
    <div
      ref={ref}
      className={`relative group rounded-lg shadow-sm border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 overflow-hidden transition-all ${isDragging ? "opacity-70 shadow-lg rotate-1" : ""}`}
    >
      <Link href={`/dashboard/projects/${project.id}`} className="block p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
            {project.title || "Sem título"}
          </h3>
          {project.priority && (
            <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[project.priority as "low" | "medium" | "high"]}`}>
              {project.priority === "high" ? "Alta" : project.priority === "medium" ? "Média" : "Baixa"}
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {project.description || "Sem descrição"}
        </p>
      </Link>
      <div className="px-4 pb-3 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <span>
          {project.createdAt?.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
          })}
        </span>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <FiMoreVertical size={16} />
        </button>
      </div>
      {/* Botões mobile */}
      {(isAdmin || isOwner) && (
        <div className="flex md:hidden gap-2 px-4 pb-3 flex-wrap">
          <button
            className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1"
            disabled={actionLoading === "archive"}
            onClick={async () => {
              setActionLoading("archive");
              await moveProject(project.id, project.status, true);
              setActionLoading(null);
            }}
          >
            {actionLoading === "archive" ? <span className="animate-spin">↻</span> : null}
            Arquivar
          </button>
          <button
            className="px-2 py-1 text-xs rounded bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1"
            disabled={actionLoading === "remove"}
            onClick={async () => {
              setActionLoading("remove");
              await moveProject(project.id, project.status, false, true);
              setActionLoading(null);
            }}
          >
            {actionLoading === "remove" ? <span className="animate-spin">↻</span> : null}
            Remover
          </button>
          {["TO_DO", "IN_PROGRESS", "DONE"].filter(s => s !== project.status).map((s) => (
            <button
              key={s}
              className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center gap-1"
              disabled={actionLoading === s}
              onClick={async () => {
                setActionLoading(s);
                await moveProject(project.id, s as "TO_DO" | "IN_PROGRESS" | "DONE");
                setActionLoading(null);
              }}
            >
              {actionLoading === s ? <span className="animate-spin">↻</span> : null}
              {s === "TO_DO" ? "A Fazer" : s === "IN_PROGRESS" ? "Em Progresso" : "Concluído"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}