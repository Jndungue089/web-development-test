"use client";
import { FiPlay, FiPause, FiRefreshCw } from "react-icons/fi";

interface PomodoroControlsProps {
  isActive: boolean;
  onToggle: () => void;
  onReset: () => void;
  className?: string;
}

export const PomodoroControls = ({ 
  isActive, 
  onToggle, 
  onReset,
  className = "" 
}: PomodoroControlsProps) => {
  return (
    <div className={`flex space-x-3 ${className}`}>
      <button
        onClick={onToggle}
        className={`flex items-center justify-center w-12 h-12 rounded-full ${
          isActive
            ? "bg-yellow-500 hover:bg-yellow-600 text-white"
            : "bg-green-500 hover:bg-green-600 text-white"
        } transition`}
        aria-label={isActive ? "Pausar" : "Iniciar"}
      >
        {isActive ? <FiPause size={20} /> : <FiPlay size={20} />}
      </button>
      <button
        onClick={onReset}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition"
        aria-label="Reiniciar"
      >
        <FiRefreshCw size={20} className="dark:text-white" />
      </button>
    </div>
  );
};