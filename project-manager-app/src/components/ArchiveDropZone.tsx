import { useRef, useEffect } from "react";
import { useDrop } from "react-dnd";
// Permissão: só permite drop se isAdmin/Owner

export default function ArchiveDropZone({ isOver, setIsOver, onDrop, canArchive }: { isOver: boolean; setIsOver: (v: boolean) => void; onDrop: (id: string) => void; canArchive?: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [{ isOverCurrent }, drop] = useDrop(() => ({
    accept: "PROJECT",
    canDrop: () => !!canArchive,
    drop: (item: { id: string }) => {
      if (canArchive) onDrop(item.id);
    },
    collect: (monitor) => ({
      isOverCurrent: monitor.isOver(),
    }),
    hover: () => setIsOver(true),
  }));
  useEffect(() => {
    if (ref.current) drop(ref.current);
    if (!isOverCurrent) setIsOver(false);
  }, [ref, drop, isOverCurrent, setIsOver]);
  return (
    <div
      ref={ref}
      className={`mt-8 mb-2 flex items-center justify-center h-24 rounded-xl border-2 border-dashed ${isOver ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-gray-300 dark:border-gray-700"} transition-all`}
      style={{ pointerEvents: canArchive ? "auto" : "none", opacity: canArchive ? 1 : 0.5 }}
    >
      <span className={`text-lg font-semibold ${isOver ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"}`}>
        {isOver ? "Solte aqui para arquivar o projeto" : canArchive ? "Área de Arquivação" : "Você não tem permissão para arquivar"}
      </span>
    </div>
  );
}
