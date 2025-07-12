"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, deleteDoc, collection, getDocs, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { toast } from "sonner";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { Project, Task, ProjectStats } from "@/types/project";
import ProjectHeader from "@/components/dashboard/project/details/ProjectHeader";
import ProjectMembers from "@/components/dashboard/project/details/ProjectMembers";
import ProjectNav from "@/components/dashboard/project/details/ProjectNav";
import ProjectOverview from "@/components/dashboard/project/details/ProjectOverview";
import ProjectPomodoro from "@/components/dashboard/project/details/ProjectPomodoro";
import ProjectTasks from "@/components/dashboard/project/details/ProjectTasks";
import ProjectTimeline from "@/components/dashboard/project/details/ProjectTimeline";


const TaskModal = dynamic(() => import("./TaskModal"), { ssr: false });

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [allUsers, setAllUsers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "members" | "timeline" | "pomodoro">("overview");

  // Carregar projeto e tarefas
  useEffect(() => {
    if (!id) return;

    const fetchProject = async () => {
      const docRef = doc(db, "projects", id as string);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const projectData = docSnap.data() as Project;
        setProject({ ...projectData, id: docSnap.id });
      }
      setLoading(false);
    };

    const fetchUsers = async () => {
      const usersSnapshot = await getDocs(collection(db, "users"));
      setAllUsers(usersSnapshot.docs.map((doc) => doc.id));
    };

    fetchProject();
    fetchUsers();

    const unsubscribe = onSnapshot(collection(db, "projects", id as string, "tasks"), (snapshot) => {
      const updatedTasks = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          notes: data.notes,
          status: data.status || "pending",
          dueDate: data.dueDate,
          completedAt: data.completedAt,
          assignedTo: data.assignedTo || [],
          createdAt: data.createdAt,
          priority: data.priority || "medium",
        } as Task;
      });
      setTasks(updatedTasks);
    });

    return () => unsubscribe();
  }, [id]);

  // Calcular estatísticas do projeto
  const projectStats: ProjectStats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t) => t.status === "completed").length,
    progress: tasks.length > 0 ? Math.round((tasks.filter((t) => t.status === "completed").length / tasks.length) * 100) : 0,
    overdueTasks: tasks.filter((t) => t.dueDate && new Date() > new Date(t.dueDate) && t.status !== "completed").length,
    highPriorityTasks: tasks.filter((t) => t.priority === "high").length,
  };

  const handleDeleteProject = async () => {
    if (!id) return;
    if (!confirm("Tem certeza que deseja excluir este projeto e todas as suas tarefas?")) return;

    try {
      const tasksSnapshot = await getDocs(collection(db, "projects", id as string, "tasks"));
      const deletePromises = tasksSnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      await deleteDoc(doc(db, "projects", id as string));
      toast.success("Projeto excluído com sucesso!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Erro ao excluir projeto");
      console.error("Error deleting project:", error);
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: Task["status"]) => {
    if (!id) return;

    try {
      const taskRef = doc(db, "projects", id as string, "tasks", taskId);
      const taskData = tasks.find((t) => t.id === taskId);

      if (!taskData) return;

      const updates: Partial<Task> = { status: newStatus };

      if (newStatus === "completed") {
        updates.completedAt = new Date().toISOString();

        if (taskData.dueDate && new Date() > new Date(taskData.dueDate)) {
          toast.warning("Tarefa concluída após o prazo!");
          updates.status = "overdue";
        }
      }

      await updateDoc(taskRef, updates);
      toast.success("Status da tarefa atualizado!");
    } catch (error) {
      toast.error("Erro ao atualizar tarefa");
      console.error("Error updating task:", error);
    }
  };

  const openTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  if (loading) return <div className="flex justify-center p-8">Carregando...</div>;
  if (!project) return <div className="p-8">Projeto não encontrado.</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-7xl mx-auto p-6">
        <ProjectHeader project={project} onDelete={handleDeleteProject} />
        <ProjectNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          taskCount={tasks.length}
          memberCount={project.members.length}
        />
        <div className="mb-8">
          {activeTab === "overview" && <ProjectOverview project={project} stats={projectStats} />}
          {activeTab === "tasks" && (
            <ProjectTasks
              tasks={tasks}
              setShowTaskModal={setShowTaskModal}
              onTaskClick={openTaskDetails}
              onStatusChange={handleTaskStatusChange}
            />
          )}
          {activeTab === "members" && <ProjectMembers members={project.members} />}
          {activeTab === "timeline" && <ProjectTimeline project={project} tasks={tasks} />}
          {activeTab === "pomodoro" && <ProjectPomodoro projectId={id as string} tasks={tasks} />}
        </div>
        <AnimatePresence>
          {showTaskModal && (
            <TaskModal
              projectId={id as string}
              task={selectedTask}
              allUsers={allUsers}
              projectMembers={project.members}
              onClose={() => {
                setShowTaskModal(false);
                setSelectedTask(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  );
}