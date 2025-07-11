import Link from "next/link";
import { FiCalendar, FiEdit, FiTrash2 } from "react-icons/fi";
import { Project } from "@/types/project";

interface ProjectHeaderProps {
  project: Project;
  onDelete: () => void;
}

export default function ProjectHeader({ project, onDelete }: ProjectHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h1 className="text-3xl font-bold dark:text-white">{project.title}</h1>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
          <FiCalendar className="mr-1" />
          <span>
            {project.startDate?.toDate().toLocaleDateString("pt-PT")} -{" "}
            {project.endDate?.toDate().toLocaleDateString("pt-PT")}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <Link
          href={`/dashboard/projects/edit/${project.id}`}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
        >
          <FiEdit size={16} />
          Editar Projeto
        </Link>
        <button
          onClick={onDelete}
          className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition"
        >
          <FiTrash2 size={16} />
          Excluir
        </button>
      </div>
    </div>
  );
}