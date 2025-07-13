"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import { db, auth } from "@/firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { toDateSafe } from "@/utils/dateUtils";

type Project = {
  id: string;
  title: string;
  description: string;
  status: "TO_DO" | "IN_PROGRESS" | "DONE";
  createdAt: Date;
  priority: "low" | "medium" | "high";
  startDate: Date;
  endDate: Date;
  owner: string;
  members: string[];
  role: "Owner" | "Participant";
  archived: boolean;
};

export default function ArchivedProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, loadingAuth] = useAuthState(auth);

  useEffect(() => {
    if (loadingAuth || !user) return;
    const unsubscribe = onSnapshot(collection(db, "projects"), (snapshot) => {
      const projectsData: any = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          const parseDate = (date: any): Date | undefined => {
            const d = toDateSafe(date);
            return d ?? undefined;
          };
          const priority = ["low", "medium", "high"].includes(data.priority) ? data.priority : undefined;
          const isOwner = data.owner === user.uid;
          const isMember = (data.members || []).includes(user.email);
          const role = isOwner ? "Owner" : isMember ? "Participant" : null;
          if (!role) return null;
          return {
            id: doc.id,
            title: data.title || "",
            description: data.description || "",
            status: data.status,
            priority,
            createdAt: parseDate(data.createdAt),
            startDate: parseDate(data.startDate),
            endDate: parseDate(data.endDate),
            owner: data.owner || "",
            members: data.members || [],
            role: role as "Owner" | "Participant",
            archived: !!data.archived,
          };
        })
        .filter((project): project is Project => project !== null && project.archived);
      setProjects(projectsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user, loadingAuth]);

  if (loading || loadingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-gray-500">Carregando projetos arquivados...</div>
      </div>
    );
  }

  if (!user) return null;

  // Função para desarquivar um projeto
  const unarchiveProject = async (id: string) => {
    if (!window.confirm("Deseja realmente desarquivar este projeto?")) return;
    try {
      await import("firebase/firestore").then(({ doc, updateDoc }) => updateDoc(doc(db, "projects", id), { archived: false }));
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      alert("Erro ao desarquivar projeto");
    }
  };

  // Função para desarquivar todos
  const unarchiveAll = async () => {
    if (!window.confirm("Deseja realmente desarquivar TODOS os projetos arquivados?")) return;
    try {
      await Promise.all(projects.map(p => import("firebase/firestore").then(({ doc, updateDoc }) => updateDoc(doc(db, "projects", p.id), { archived: false }))));
      setProjects([]);
    } catch (error) {
      alert("Erro ao desarquivar projetos");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center mb-6 justify-between">
        <h1 className="ml-4 text-2xl font-bold text-gray-900 dark:text-white">Projetos Arquivados</h1>
        {projects.length > 1 && (
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            onClick={async () => {
              if (window.confirm("Deseja desarquivar TODOS os projetos arquivados?")) {
                try {
                  await Promise.all(projects.map(p => import("firebase/firestore").then(({ doc, updateDoc }) => updateDoc(doc(db, "projects", p.id), { archived: false }))));
                  setProjects([]);
                } catch (error) {
                  alert("Erro ao desarquivar projetos");
                }
              }
            }}
          >
            Desarquivar Todos
          </button>
        )}
      </div>
      {projects.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">Nenhum projeto arquivado.</div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-semibold text-lg text-gray-900 dark:text-white">{project.title || "Sem título"}</h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{project.description || "Sem descrição"}</p>
                  <div className="mt-2 flex gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">{project.role === "Owner" ? "Criador(a)" : "Participante"}</span>
                    {project.priority && (
                      <span className={`text-xs px-2 py-1 rounded-full ${project.priority === "high" ? "bg-red-100 text-red-800" : project.priority === "medium" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>
                        {project.priority === "high" ? "Alta" : project.priority === "medium" ? "Média" : "Baixa"}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Criado em: {project.createdAt?.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </div>
                </div>
                <button
                  className="ml-4 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  onClick={async () => {
                    if (window.confirm(`Deseja desarquivar o projeto "${project.title || 'Sem título'}"?`)) {
                      try {
                        await import("firebase/firestore").then(({ doc, updateDoc }) => updateDoc(doc(db, "projects", project.id), { archived: false }));
                        setProjects(projects.filter(p => p.id !== project.id));
                      } catch (error) {
                        alert("Erro ao desarquivar projeto");
                      }
                    }
                  }}
                >
                  Desarquivar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
