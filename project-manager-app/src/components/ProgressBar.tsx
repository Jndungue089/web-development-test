"use client";
import { motion } from "framer-motion";

type ProgressBarProps = {
  value: number; // Valor entre 0 e 100
  color?: string; // Cor opcional
  height?: number; // Altura da barra em pixels
  showLabel?: boolean; // Mostrar porcentagem dentro da barra
  className?: string; // Classes adicionais
};

export default function ProgressBar({
  value,
  color = "bg-blue-600",
  height = 8,
  showLabel = false,
  className = "",
}: ProgressBarProps) {
  // Garantir que o valor esteja entre 0 e 100
  const progress = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full ${className}`}>
      <div
        className="w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
        style={{ height: `${height}px` }}
      >
        <motion.div
        role="progressbar"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${color} relative`}
        >
          {showLabel && (
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white">
              {progress}%
            </span>
          )}
        </motion.div>
      </div>
    </div>
  );
}