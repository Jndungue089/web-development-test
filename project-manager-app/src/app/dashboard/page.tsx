"use client";
import { useEffect, useRef, useState } from "react";
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiMoreVertical, FiCheck, FiClock, FiPlay, FiArchive } from "react-icons/fi";
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import ActionConfirmDialog from "@/components/ActionConfirmDialog";
import DeleteDropZone from "./DeleteDropZone";
import ProjectCardBase from "@/components/ProjectCardBase";
import DashboardStats from "@/components/DashboardStats";
import ArchiveDropZone from "@/components/ArchiveDropZone";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);
import Link from "next/link";
import { toDateSafe } from "@/utils/dateUtils";

// Tipos para o projeto
type Project = {
  id: string;
  title: string;
  description: string;
  status: "TO_DO" | "IN_PROGRESS" | "DONE";
  createdAt?: Date;
  priority?: "low" | "medium" | "high";
  role?: "Owner" | "Participant";
};

// Componente: Card de Projeto Draggable
const ProjectCard = ({ project, moveProject, userRole, isAdmin }: { project: Project; moveProject: (id: string, newStatus: Project["status"], archive?: boolean, remove?: boolean) => void; userRole?: string; isAdmin?: boolean }) => {
  return <ProjectCardBase project={{ ...project, role: userRole === "Owner" || userRole === "Participant" ? userRole : undefined, isAdmin }} moveProject={moveProject} />;
};

// Componente: Coluna Drop Zone
const ProjectColumn = ({
  status,
  projects,
  moveProject,
}: {
  status: Project["status"];
  projects: Project[];
  moveProject: (id: string, newStatus: Project["status"]) => void;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    if (ref.current) drop(ref.current);
  }, [ref, drop]);

  const statusConfig = {
    TO_DO: { icon: <FiClock className="text-blue-500" />, title: "A Fazer", color: "bg-blue-100 dark:bg-blue-900/30" },
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
      className={`flex-1 rounded-xl p-4 transition-colors ${isOver ? "bg-gray-100/50 dark:bg-gray-700/50" : ""
        }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${statusConfig[status].color}`}>
            {statusConfig[status].icon}
          </div>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {statusConfig[status].title}
          </h2>
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700">
          {count}
        </span>
      </div>

      <motion.div
        layout
        className="space-y-3 min-h-[100px]"
      >
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
              <ProjectCard project={project} moveProject={moveProject} userRole={project.role} isAdmin={/* lógica para admin */ false} />
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
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nenhum projeto nesta coluna
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [archivedProjects, setArchivedProjects] = useState<Project[]>([]);
  const [isOverArchive, setIsOverArchive] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState<{ id: string; open: boolean } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string; open: boolean } | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "projects"), (snapshot) => {
      const allProjects = snapshot.docs.map((doc) => {
        const data = doc.data();
        // Supondo que userId e userEmail estejam disponíveis
        const userId = "userId"; // Substitua pelo id do usuário autenticado
        const userEmail = "userEmail"; // Substitua pelo email do usuário autenticado
        const isOwner = data.owner === userId;
        const isMember = (data.members || []).includes(userEmail);
        const role: "Owner" | "Participant" | undefined = isOwner ? "Owner" : isMember ? "Participant" : undefined;
        return {
          id: doc.id,
          title: data.title || "",
          description: data.description || "",
          status: data.status || "TO_DO",
          priority: data.priority || "medium",
          createdAt: toDateSafe(data.createdAt),
          archived: !!data.archived,
          role,
        };
      });
      setProjects(allProjects.filter(p => !p.archived));
      setArchivedProjects(allProjects.filter(p => p.archived));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const moveProject = async (id: string, newStatus: Project["status"], archive = false, remove = false) => {
    if (archive) {
      setConfirmArchive({ id, open: true });
      return;
    }
    if (remove) {
      const project = projects.find(p => p.id === id);
      if (project) setConfirmDelete({ id, name: project.title, open: true });
      return;
    }
    try {
      const projectRef = doc(db, "projects", id);
      await updateDoc(projectRef, { status: newStatus });
      toast.success(`Status atualizado para ${newStatus === "TO_DO" ? "A Fazer" : newStatus === "IN_PROGRESS" ? "Em Progresso" : "Concluído"}`);
    } catch (error) {
      toast.error("Erro ao atualizar o projeto");
      console.error("Error moving project:", error);
    }
  };

  const handleArchiveConfirm = async () => {
    if (!confirmArchive) return;
    try {
      const projectRef = doc(db, "projects", confirmArchive.id);
      await updateDoc(projectRef, { archived: true });
      toast.success("Projeto arquivado!");
    } catch (error) {
      toast.error("Erro ao arquivar o projeto");
    }
    setConfirmArchive(null);
  };

  const handleDeleteConfirm = async (id: string) => {
    try {
      await import("firebase/firestore").then(({ doc, deleteDoc }) => deleteDoc(doc(db, "projects", id)));
      toast.success("Projeto removido!");
    } catch (error) {
      toast.error("Erro ao remover o projeto");
    }
    setConfirmDelete(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-gray-500">Carregando projetos...</div>
      </div>
    );
  }

  // Estatísticas
  const stats = {
    totalProjects: projects.length,
    completed: projects.filter((p) => p.status === "DONE").length,
    inProgress: projects.filter((p) => p.status === "IN_PROGRESS").length,
    overdue: projects.filter((p) => {
      if (p.status !== "DONE" && p.createdAt) {
        return new Date() > p.createdAt;
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
          if (p.status === "DONE" && p.createdAt instanceof Date && !isNaN(p.createdAt.getTime())) {
            const endMonth = p.createdAt.getMonth();
            const endYear = p.createdAt.getFullYear();
            return endMonth === date.getMonth() && endYear === date.getFullYear();
          }
          return false;
        }).length,
      };
    });

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
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
          >
            <FiPlus size={18} />
            <span>Novo Projeto</span>
          </Link>
        </div>
        {/* Estatísticas e gráficos */}
        <DashboardStats stats={stats} monthlyData={monthlyData} />
        {/* Área de deletar projeto (lado esquerdo) */}
        <div className="fixed left-0 top-1/2 -translate-y-1/2 z-40">
          <DeleteDropZone
            projects={projects}
            setConfirmDelete={setConfirmDelete}
          />
        </div>
        {/* Seção do Kanban */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProjectColumn status="TO_DO" projects={projects} moveProject={moveProject} />
          <ProjectColumn status="IN_PROGRESS" projects={projects} moveProject={moveProject} />
          <ProjectColumn status="DONE" projects={projects} moveProject={moveProject} />
        </div>
        {/* Área de Arquivação */}
        {projects.length > 0 && (
          <ArchiveDropZone
            isOver={isOverArchive}
            setIsOver={setIsOverArchive}
            onDrop={async (id: string) => {
              setConfirmArchive({ id, open: true });
            }}
          />
        )}
        {/* Botão para ver projetos arquivados */}
        {archivedProjects.length > 0 && (
          <div className="flex justify-center mt-6">
            <Link href="/dashboard/projects/archived" className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition">
              Ver Projetos Arquivados
            </Link>
          </div>
        )}
        {/* Diálogo de confirmação de arquivação */}
        <ActionConfirmDialog
          open={!!confirmArchive?.open}
          title="Arquivar Projeto"
          description="Tem certeza que deseja arquivar este projeto?"
          confirmLabel="Arquivar"
          onConfirm={handleArchiveConfirm}
          onCancel={() => setConfirmArchive(null)}
        />
        {/* Diálogo de confirmação de remoção */}
        <ActionConfirmDialog
          open={!!confirmDelete?.open}
          title={`Remover Projeto`}
          description={`Tem a certeza que deseja remover o projeto ${confirmDelete?.name}?\nDigite 'delete ${confirmDelete?.name}' para confirmar.`}
          confirmLabel="Remover"
          confirmText={confirmDelete ? `delete ${confirmDelete.name}` : undefined}
          onConfirm={() => confirmDelete && handleDeleteConfirm(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
        />
      </div>
    </DndProvider>
  );
}

// Card de Estatística para indicadores
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
      <div className={`p-3 rounded-lg bg-opacity-20 ${color}`}>{icon}</div>
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