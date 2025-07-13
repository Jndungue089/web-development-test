"use client";
import { useState, useEffect, useRef } from "react";
// Adiciona intensidade de foco e popup
import { FiCheck, FiMinimize, FiX } from "react-icons/fi";
import { doc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "sonner";
import { PomodoroCounter } from "./Pomodoro/PomodoroCounter";
import { PomodoroControls } from "./Pomodoro/PomodoroControls";

type PomodoroMode = "focus" | "shortBreak" | "longBreak";

interface Task {
    id: string;
    title: string;
    status: 'pending' | 'in_progress' | 'completed' | 'overdue';
}

interface PomodoroTimerProps {
    projectId: string;
    tasks?: Task[];
    taskId?: string;
    taskTitle?: string;
}

const PomodoroTimer = ({
    projectId,
    tasks,
}: PomodoroTimerProps) => {
    const [user] = useAuthState(auth);
    const [minutes, setMinutes] = useState<number>(25);
    const [focusLevel, setFocusLevel] = useState<'leve' | 'moderado' | 'intenso'>('moderado');
    // Removido modo popup
    const [seconds, setSeconds] = useState<number>(0);
    const [isActive, setIsActive] = useState<boolean>(false);
    const [mode, setMode] = useState<PomodoroMode>("focus");
    const [completedPomodoros, setCompletedPomodoros] = useState<number>(0);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [showTaskSelector, setShowTaskSelector] = useState<boolean>(true);
    const [isMinimized, setIsMinimized] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    // Removido BroadcastChannel

    // Settings
    const settings = {
        leve: 15,
        moderado: 25,
        intenso: 40,
        shortBreak: 5,
        longBreak: 15,
        longBreakInterval: 4
    };

    // Filter incomplete tasks
    const incompleteTasks = (tasks ?? []).filter(task => task?.status !== 'completed');


    // Initialize timer
    useEffect(() => {
        resetTimer();
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [mode, focusLevel]);

    // Removido BroadcastChannel


    // Update timer
    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(() => {
                if (seconds === 0) {
                    if (minutes === 0) {
                        timerComplete();
                    } else {
                        setMinutes((prev) => prev - 1);
                        setSeconds(59);
                    }
                } else {
                    setSeconds((prev) => prev - 1);
                }
            }, 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, minutes, seconds]);


    const timerComplete = async () => {

        if (mode === "focus") {
            const newCompletedPomodoros = completedPomodoros + 1;
            setCompletedPomodoros(newCompletedPomodoros);

            // Save to Firebase if task exists
            if (selectedTask && projectId && user) {
                try {
                    await updateDoc(doc(db, "projects", projectId, "tasks", selectedTask.id), {
                        pomodoroSessions: arrayUnion({
                            date: serverTimestamp(),
                            userId: user.uid,
                            duration: settings[focusLevel]
                        })
                    });
                } catch (error) {
                    console.error("Error saving pomodoro session:", error);
                }
            }

            // Check if it's time for a long break
            if (newCompletedPomodoros % settings.longBreakInterval === 0) {
                setMode("longBreak");
                toast.success("Bom trabalho! Hora de uma pausa longa.");
            } else {
                setMode("shortBreak");
                toast.success("Bom trabalho! Hora de uma pausa curta.");
            }
        } else {
            setMode("focus");
            toast.info("Hora de focar novamente!");
        }

        resetTimer();
        setIsActive(false);
    };

    const resetTimer = () => {
        switch (mode) {
            case "focus":
                setMinutes(settings[focusLevel]);
                break;
            case "shortBreak":
                setMinutes(settings.shortBreak);
                break;
            case "longBreak":
                setMinutes(settings.longBreak);
                break;
        }
        setSeconds(0);
    };

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const handleReset = () => {
        setIsActive(false);
        resetTimer();
    };

    const formatTime = () => {
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const getModeLabel = () => {
        switch (mode) {
            case "focus":
                return "Foco";
            case "shortBreak":
                return "Pausa Curta";
            case "longBreak":
                return "Pausa Longa";
        }
    };

    const handleTaskComplete = async () => {
        if (!selectedTask || !projectId) return;

        try {
            await updateDoc(doc(db, "projects", projectId, "tasks", selectedTask.id), {
                status: 'completed',
                completedAt: serverTimestamp()
            });
            toast.success("Tarefa marcada como concluída!");
            setSelectedTask(null);
            setShowTaskSelector(true);
        } catch (error) {
            toast.error("Erro ao marcar tarefa como concluída");
            console.error("Error completing task:", error);
        }
    };

    const handleTaskSelect = (task: Task) => {
        setSelectedTask(task);
        setShowTaskSelector(false);
        // Update task status to in_progress
        updateDoc(doc(db, "projects", projectId, "tasks", task.id), {
            status: 'in_progress'
        });
    };

    // ...existing code...
    return (
        <>
            {/* Configuração de intensidade de foco */}
            <div className="mb-4 flex gap-2 items-center">
                <label className="font-medium text-sm dark:text-white">Intensidade:</label>
                <select
                    value={focusLevel}
                    onChange={e => setFocusLevel(e.target.value as 'leve' | 'moderado' | 'intenso')}
                    className="rounded px-2 py-1 border dark:bg-gray-800 dark:text-white"
                >
                    <option value="leve">Leve (15 min)</option>
                    <option value="moderado">Moderado (25 min)</option>
                    <option value="intenso">Intenso (40 min)</option>
                </select>
            </div>
            {/* Removido botão de abrir popup */}
            <div className={`bg-white dark:bg-gray-800 rounded-lg md:rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 w-full max-w-md mx-auto`}>
                {showTaskSelector ? (
                    <div className="space-y-3 sm:space-y-4">
                        <h3 className="text-base sm:text-lg font-semibold dark:text-white">Selecione uma tarefa para focar</h3>
                        {incompleteTasks.length > 0 ? (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {incompleteTasks.map(task => (
                                    <button
                                        key={task.id}
                                        onClick={() => handleTaskSelect(task)}
                                        className="w-full p-2 sm:p-3 text-left rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm sm:text-base"
                                    >
                                        <span className="line-clamp-1">{task.title}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Nenhuma tarefa pendente</p>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-start mb-3 sm:mb-4">
                            <div className="max-w-[80%]">
                                <h3 className="font-medium text-gray-700 dark:text-gray-300 text-xs sm:text-sm">Tarefa atual:</h3>
                                <p className="text-base sm:text-lg font-semibold dark:text-white truncate">{selectedTask?.title}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedTask(null);
                                    setShowTaskSelector(true);
                                }}
                                className="p-1 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                            >
                                <FiX className="text-gray-500 dark:text-gray-400" size={16} />
                            </button>
                        </div>

                        <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                            {/* Mode and timer */}
                            <div className="text-center">
                                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${mode === "focus"
                                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                        : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                    }`}>
                                    {getModeLabel()}
                                </span>
                                <div className="text-4xl sm:text-5xl font-bold my-3 sm:my-4 dark:text-white">
                                    {formatTime()}
                                </div>
                            </div>

                            {/* Main controls */}
                            <PomodoroControls
                                isActive={isActive}
                                onToggle={toggleTimer}
                                onReset={handleReset}
                            />

                            {/* Task complete button */}
                            {mode === "focus" && (
                                <button
                                    onClick={handleTaskComplete}
                                    className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm sm:text-base"
                                >
                                    <FiCheck size={14} className="flex-shrink-0" />
                                    <span className="whitespace-nowrap">Marcar como concluída</span>
                                </button>
                            )}

                            {/* Pomodoro counter */}
                            <PomodoroCounter
                                completed={completedPomodoros}
                                total={settings.longBreakInterval}
                            />

                            {/* Next break info */}
                            {mode === "focus" && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-2 text-center">
                                    {settings.longBreakInterval - (completedPomodoros % settings.longBreakInterval) === 1
                                        ? "Pausa longa no próximo ciclo"
                                        : `Pausa longa em ${settings.longBreakInterval - (completedPomodoros % settings.longBreakInterval)
                                        } ciclos`}
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
};


export default PomodoroTimer;