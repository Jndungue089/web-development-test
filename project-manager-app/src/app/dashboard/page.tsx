"use client";
import { useEffect, useRef, useState } from "react";
import { collection, onSnapshot, updateDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiMoreVertical, FiCheck, FiClock, FiPlay, FiArchive, FiPieChart, FiTrendingUp, FiAlertTriangle } from "react-icons/fi";
import Link from "next/link";
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Tipos para o projeto
type Project = {
  id: string;
  title: string;
  description: string;
  status: "TO_DO" | "IN_PROGRESS" | "DONE";
  createdAt?: Date;
  priority?: "low" | "medium" | "high";
  startDate?: Date;
  endDate?: Date;
};

// Componente: Card de Estatística
const StatCard = ({ icon, title, value, trend, color }: { icon: React.ReactNode; title: string; value: string | number; trend?: string; color: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 ${color}`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <h3 className="text-2xl font-bold mt-1 dark:text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg bg-opacity-20 ${color}`}>
        {icon}
      </div>
    </div>
    {trend && (
      <div className="mt-2 flex items-center text-sm">
        <span className={`${trend.startsWith('+') ? 'text-green-500' : 'text-red-500'} flex items-center`}>
          {trend.startsWith('+') ? '↑' : '↓'} {trend}
        </span>
        <span className="text-gray-500 dark:text-gray-400 ml-1">vs último mês</span>
      </div>
    )}
  </motion.div>
);

// Componente: Card de Projeto Draggable
const ProjectCard = ({ project, moveProject, updatePriority }: { project: Project; moveProject: (id: string, newStatus: Project["status"]) => void; updatePriority: (id: string, newPriority: Project["priority"]) => void }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "PROJECT",
    item: { id: project.id, status: project.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const ref = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  drag(ref);

  const priorityColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };

  const handlePriorityChange = async (newPriority: Project["priority"]) => {
    if (newPriority && newPriority !== project.priority) {
      await updatePriority(project.id, newPriority);
      setIsDropdownOpen(false);
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`relative group rounded-lg shadow-sm border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 overflow-hidden transition-all ${
        isDragging ? "opacity-70 shadow-lg rotate-1" : ""
      }`}
    >
      <Link href={`/dashboard/projects/${project.id}`} className="block p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
            {project.title || "Sem título"}
          </h3>
          {project.priority && (
            <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[project.priority]}`}>
              {project.priority === "high" ? "Alta" : project.priority === "medium" ? "Média" : "Baixa"}
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {project.description || "Sem descrição"}
        </p>
      </Link>

      <div className="px-4 pb-3 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <span>
          {project.createdAt?.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
          })}
        </span>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FiMoreVertical size={16} />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
              <div className="py-1">
                {["low", "medium", "high"].map((priority) => (
                  <button
                    key={priority}
                    onClick={() => handlePriorityChange(priority as Project["priority"])}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {priority === "high" ? "Alta" : priority === "medium" ? "Média" : "Baixa"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Componente: Coluna Drop Zone
const ProjectColumn = ({
  status,
  projects,
  moveProject,
  updatePriority,
}: {
  status: Project["status"];
  projects: Project[];
  moveProject: (id: string, newStatus: Project["status"]) => void;
  updatePriority: (id: string, newPriority: Project["priority"]) => void;
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "PROJECT",
    drop: (item: { id: string; status: Project["status"] }) => {
      if (item.status !== status) {
        moveProject(item.id, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const ref = useRef<HTMLDivElement>(null);
  drop(ref);

  const statusConfig = {
    TO_DO: { icon: <FiClock className="text-blue-500" />, title: "Por Fazer", color: "bg-blue-100 dark:bg-blue-900/30" },
    IN_PROGRESS: { icon: <FiPlay className="text-yellow-500" />, title: "Em Progresso", color: "bg-yellow-100 dark:bg-yellow-900/30" },
    DONE: { icon: <FiCheck className="text-green-500" />, title: "Concluído", color: "bg-green-100 dark:bg-green-900/30" },
  };

  const filteredProjects = projects.filter((p) => p.status === status);
  const count = filteredProjects.length;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex-1 rounded-xl p-4 transition-colors ${isOver ? "bg-gray-100/50 dark:bg-gray-700/50" : ""}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${statusConfig[status].color}`}>
            {statusConfig[status].icon}
          </div>
          <h2 className="font-semibold text-gray-900 dark:text-white">{statusConfig[status].title}</h2>
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700">{count}</span>
      </div>

      <motion.div layout className="space-y-3 min-h-[100px]">
        <AnimatePresence>
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <ProjectCard project={project} moveProject={moveProject} updatePriority={updatePriority} />
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-8 text-center"
          >
            <FiArchive className="text-gray-400 mb-2" size={24} />
            <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum projeto nesta coluna</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "projects"), (snapshot) => {
      const projectsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        const validStatus = ["TO_DO", "IN_PROGRESS", "DONE"].includes(data.status) ? data.status : "TO_DO";
        // Convert string dates to Date objects
        const parseDate = (date: any): Date | undefined => {
          if (date instanceof Timestamp) return date.toDate();
          if (typeof date === "string" && date) return new Date(date);
          return undefined;
        };
        return {
          id: doc.id,
          title: data.title || "",
          description: data.description || "",
          status: validStatus as Project["status"],
          priority: ["low", "medium", "high"].includes(data.priority) ? data.priority : "medium",
          createdAt: parseDate(data.createdAt),
          startDate: parseDate(data.startDate),
          endDate: parseDate(data.endDate),
        };
      });
      setProjects(projectsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const moveProject = async (id: string, newStatus: Project["status"]) => {
    try {
      const projectRef = doc(db, "projects", id);
      await updateDoc(projectRef, { status: newStatus });
      toast.success(`Status atualizado para ${newStatus === "TO_DO" ? "Por Fazer" : newStatus === "IN_PROGRESS" ? "Em Progresso" : "Concluído"}`);
    } catch (error) {
      toast.error("Erro ao atualizar o projeto");
      console.error("Error moving project:", error);
    }
  };

  const updatePriority = async (id: string, newPriority: Project["priority"]) => {
    try {
      const projectRef = doc(db, "projects", id);
      await updateDoc(projectRef, { priority: newPriority });
      toast.success(`Prioridade atualizada para ${newPriority === "high" ? "Alta" : newPriority === "medium" ? "Média" : "Baixa"}`);
    } catch (error) {
      toast.error("Erro ao atualizar prioridade");
      console.error("Error updating priority:", error);
    }
  };

  // Calcular estatísticas
  const stats = {
    totalProjects: projects.length,
    completed: projects.filter((p) => p.status === "DONE").length,
    inProgress: projects.filter((p) => p.status === "IN_PROGRESS").length,
    overdue: projects.filter((p) => {
      if (p.status !== "DONE" && p.endDate) {
        return new Date() > p.endDate;
      }
      return false;
    }).length,
    completionRate: projects.length > 0 ? Math.round((projects.filter((p) => p.status === "DONE").length / projects.length) * 100) : 0,
    highPriority: projects.filter((p) => p.priority === "high").length,
  };

  // Dados para o gráfico de Progresso Mensal
  const monthlyData = Array(6)
    .fill(0)
    .map((_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return {
        month: date.toLocaleString("pt-BR", { month: "short" }),
        completed: projects.filter((p) => {
          if (p.status === "DONE" && p.endDate instanceof Date && !isNaN(p.endDate.getTime())) {
            const endMonth = p.endDate.getMonth();
            const endYear = p.endDate.getFullYear();
            return endMonth === date.getMonth() && endYear === date.getFullYear();
          }
          return false;
        }).length,
      };
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-gray-500">Carregando projetos...</div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            Dashboard de Projetos
          </motion.h1>
          <Link
            href="/dashboard/projects/new"
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FiPlus size={18} />
            <span>Novo Projeto</span>
          </Link>
        </div>

        {/* Seção de Estatísticas */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Visão Geral</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<FiPieChart className="text-blue-500" size={20} />}
              title="Total de Projetos"
              value={stats.totalProjects}
              trend="+12%"
              color="bg-blue-50 dark:bg-blue-900/20"
            />
            <StatCard
              icon={<FiCheck className="text-green-500" size={20} />}
              title="Concluídos"
              value={stats.completed}
              color="bg-green-50 dark:bg-green-900/20"
            />
            <StatCard
              icon={<FiPlay className="text-yellow-500" size={20} />}
              title="Em Progresso"
              value={stats.inProgress}
              color="bg-yellow-50 dark:bg-yellow-900/20"
            />
            <StatCard
              icon={<FiAlertTriangle className="text-red-500" size={20} />}
              title="Atrasados"
              value={stats.overdue}
              color="bg-red-50 dark:bg-red-900/20"
            />
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium mb-3 dark:text-white">Distribuição por Status</h3>
              <div className="h-64">
                <Pie
                  data={{
                    labels: ["Por Fazer", "Em Progresso", "Concluído"],
                    datasets: [
                      {
                        data: [
                          projects.filter((p) => p.status === "TO_DO").length,
                          projects.filter((p) => p.status === "IN_PROGRESS").length,
                          projects.filter((p) => p.status === "DONE").length,
                        ],
                        backgroundColor: ["#3B82F6", "#FBBF24", "#10B981"],
                        borderColor: ["#2563EB", "#D97706", "#059669"],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "top" },
                    },
                  }}
                />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium mb-3 dark:text-white">Progresso Mensal</h3>
              <div className="h-64">
                <Bar
                  data={{
                    labels: monthlyData.map((d) => d.month),
                    datasets: [
                      {
                        label: "Projetos Concluídos",
                        data: monthlyData.map((d) => d.completed),
                        backgroundColor: "#10B981",
                        borderColor: "#059669",
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: { display: true, text: "Projetos Concluídos" },
                      },
                      x: {
                        title: { display: true, text: "Mês" },
                      },
                    },
                    plugins: {
                      legend: { display: false },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* Seção do Kanban */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Quadro de Projetos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ProjectColumn status="TO_DO" projects={projects} moveProject={moveProject} updatePriority={updatePriority} />
            <ProjectColumn status="IN_PROGRESS" projects={projects} moveProject={moveProject} updatePriority={updatePriority} />
            <ProjectColumn status="DONE" projects={projects} moveProject={moveProject} updatePriority={updatePriority} />
          </div>
        </motion.section>
      </div>
    </DndProvider>
  );
}