import Link from "next/link";
import { FiCalendar, FiEdit, FiTrash2 } from "react-icons/fi";
import { Project } from "@/types/project";


interface ProjectHeaderProps {
  project: Project;
  onDelete: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export default function ProjectHeader({ project, onDelete, canEdit, canDelete }: ProjectHeaderProps) {
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
        {canEdit && (
          <Link
          href={`/dashboard/projects/edit/${project.id}`}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600`}
          tabIndex={0}
        >
          <FiEdit size={16} />
          Editar Projeto
        </Link>)}
        
        {canDelete && (
          <button
          onClick={onDelete}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50" }`}
        >
          <FiTrash2 size={16} />
          Excluir
        </button>)}
      </div>
    </div>
  );
}