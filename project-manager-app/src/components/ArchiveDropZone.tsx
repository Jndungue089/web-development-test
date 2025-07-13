import { useRef, useEffect } from "react";
import { useDrop } from "react-dnd";

export default function ArchiveDropZone({ isOver, setIsOver, onDrop }: { isOver: boolean; setIsOver: (v: boolean) => void; onDrop: (id: string) => void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [{ isOverCurrent }, drop] = useDrop(() => ({
    accept: "PROJECT",
    drop: (item: { id: string }) => {
      onDrop(item.id);
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
    >
      <span className={`text-lg font-semibold ${isOver ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"}`}>
        {isOver ? "Solte aqui para arquivar o projeto" : "Área de Arquivação"}
      </span>
    </div>
  );
}
