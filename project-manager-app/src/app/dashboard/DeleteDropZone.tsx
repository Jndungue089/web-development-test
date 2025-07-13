import { useRef } from "react";
import { useDrop } from "react-dnd";
import { FiTrash2 } from "react-icons/fi";

export default function DeleteDropZone({ projects, setConfirmDelete, canDelete }: { projects: any[]; setConfirmDelete: (v: any) => void; canDelete?: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [{ isOver, item }, drop] = useDrop(() => ({
    accept: "PROJECT",
    canDrop: () => !!canDelete,
    drop: (item: { id: string }) => {
      if (!canDelete) return;
      const project = projects.find(p => p.id === item.id);
      if (project) {
        setConfirmDelete({ id: project.id, name: project.title, open: true });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      item: monitor.getItem(),
    }),
  }));
  if (ref.current) drop(ref.current);
  return (
    <div
      ref={ref}
      className={`flex flex-col items-center justify-center w-20 h-40 bg-red-50 dark:bg-red-900/20 border-2 border-dashed ${isOver ? "border-red-500" : "border-gray-300 dark:border-gray-700"} rounded-xl shadow-lg transition-all`}
      style={{ pointerEvents: canDelete ? "auto" : "none", opacity: canDelete ? 1 : 0.5 }}
    >
      <FiTrash2 className={`mb-2 ${isOver ? "text-red-600" : "text-gray-400"}`} size={32} />
      <span className={`text-xs font-semibold ${isOver ? "text-red-600" : "text-gray-500"}`}>{canDelete ? "Remover Projeto" : "Sem permissão"}</span>
    </div>
  );
}
