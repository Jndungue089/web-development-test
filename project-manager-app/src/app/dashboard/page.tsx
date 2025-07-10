"use client";
import { useEffect, useRef, useState } from "react";
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiMoreVertical, FiCheck, FiClock, FiPlay, FiArchive } from "react-icons/fi";
import Link from "next/link";

// Tipos para o projeto
type Project = {
  id: string;
  title: string;
  description: string;
  status: "TO_DO" | "IN_PROGRESS" | "DONE";
  createdAt?: Date;
  priority?: "low" | "medium" | "high";
};

// Componente: Card de Projeto Draggable
const ProjectCard = ({ project, moveProject }: { project: Project; moveProject: (id: string, newStatus: Project["status"]) => void }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "PROJECT",
    item: { id: project.id, status: project.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  useEffect(() => {
    if (ref.current) drag(ref.current);
  }, [ref, drag]);

  const priorityColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
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
      className={`relative group rounded-lg shadow-sm border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 overflow-hidden transition-all ${isDragging ? "opacity-70 shadow-lg rotate-1" : ""
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
        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <FiMoreVertical size={16} />
        </button>
      </div>
    </motion.div>
  );
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
              <ProjectCard project={project} moveProject={moveProject} />
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

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "projects"), (snapshot) => {
      const projectsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || "",
          description: data.description || "",
          status: data.status || "TO_DO",
          priority: data.priority || "medium",
          createdAt: data.createdAt?.toDate(),
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
      toast.success(`Status atualizado para ${newStatus === "TO_DO" ? "A Fazer" : newStatus === "IN_PROGRESS" ? "Em Progresso" : "Concluído"}`);
    } catch (error) {
      toast.error("Erro ao atualizar o projeto");
      console.error("Error moving project:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-gray-500">Carregando projetos...</div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            Meus Projetos
          </motion.h1>
          <Link
            href="/dashboard/projects/new"
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FiPlus size={18} />
            <span>Novo Projeto</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProjectColumn status="TO_DO" projects={projects} moveProject={moveProject} />
          <ProjectColumn status="IN_PROGRESS" projects={projects} moveProject={moveProject} />
          <ProjectColumn status="DONE" projects={projects} moveProject={moveProject} />
        </div>
      </div>
    </DndProvider>
  );
}