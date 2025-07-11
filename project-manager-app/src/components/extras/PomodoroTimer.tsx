// components/PomodoroTimer.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import { doc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "sonner";
import { PomodoroCounter } from "./Pomodoro/PomodoroCounter";
import { PomodoroControls } from "./Pomodoro/PomodoroControls";

type PomodoroMode = "focus" | "shortBreak" | "longBreak";
type SoundType = "rain" | "coffee" | "forest" | "none";

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

const PomodoroTimer = ({ projectId, tasks }: PomodoroTimerProps) => {
    const [user] = useAuthState(auth);
    const [minutes, setMinutes] = useState<number>(25);
    const [seconds, setSeconds] = useState<number>(0);
    const [isActive, setIsActive] = useState<boolean>(false);
    const [mode, setMode] = useState<PomodoroMode>("focus");
    const [completedPomodoros, setCompletedPomodoros] = useState<number>(0);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [showTaskSelector, setShowTaskSelector] = useState<boolean>(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    // Settings
    const settings = {
        focus: 25,
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
    }, [mode]);


    // Update timer
    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(() => {
                if (seconds === 0) {
                    if (minutes === 0) {
                        timerComplete();
                    } else {
                        setMinutes(minutes - 1);
                        setSeconds(59);
                    }
                } else {
                    setSeconds(seconds - 1);
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
                            duration: settings.focus
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
                setMinutes(settings.focus);
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

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            {showTaskSelector ? (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold dark:text-white">Selecione uma tarefa para focar</h3>
                    {incompleteTasks.length > 0 ? (
                        <div className="space-y-2">
                            {incompleteTasks.map(task => (
                                <button
                                    key={task.id}
                                    onClick={() => handleTaskSelect(task)}
                                    className="w-full p-3 text-left rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                >
                                    {task.title}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">Nenhuma tarefa pendente</p>
                    )}
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-medium text-gray-700 dark:text-gray-300">Tarefa atual:</h3>
                            <p className="text-lg font-semibold dark:text-white">{selectedTask?.title}</p>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedTask(null);
                                setShowTaskSelector(true);
                            }}
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        >
                            <FiX className="text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    <div className="flex flex-col items-center space-y-4">
                        {/* Mode and timer */}
                        <div className="text-center">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${mode === "focus"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                }`}>
                                {getModeLabel()}
                            </span>
                            <div className="text-5xl font-bold my-4 dark:text-white">
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
                                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                            >
                                <FiCheck size={16} />
                                Marcar tarefa como concluída
                            </button>
                        )}

                        {/* Pomodoro counter */}
                        <PomodoroCounter
                            completed={completedPomodoros}
                            total={settings.longBreakInterval}
                        />

                        {/* Next break info */}
                        {mode === "focus" && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
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
    );
};

export default PomodoroTimer;