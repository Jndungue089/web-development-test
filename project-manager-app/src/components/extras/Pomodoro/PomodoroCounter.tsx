"use client";

interface PomodoroCounterProps {
  completed: number;
  total: number;
  className?: string;
}

export const PomodoroCounter = ({ 
  completed, 
  total,
  className = "" 
}: PomodoroCounterProps) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="flex space-x-1 mb-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-colors ${
              i < completed % total
                ? "bg-red-500"
                : "bg-gray-300 dark:bg-gray-600"
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {completed} pomodoro(s) completados hoje
      </p>
    </div>
  );
};