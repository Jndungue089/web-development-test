"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, deleteDoc, collection, getDocs, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { motion, AnimatePresence } from "framer-motion";
import { FiTrash2, FiPlus, FiCalendar, FiUser, FiPieChart, FiList, FiClock, FiAlertTriangle, FiEdit } from "react-icons/fi";
import { toast } from "sonner";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import dynamic from "next/dynamic";
import ProgressBar from "@/components/ProgressBar";
import Link from "next/link";

// Carregar componentes dinamicamente
const TaskModal = dynamic(() => import('./TaskModal'), { ssr: false });
const MemberSelector = dynamic(() => import('./MemberSelector'), { ssr: false });
const CommentsSection = dynamic(() => import('./CommentsSection'), { ssr: false });

type Task = {
  id: string;
  title: string;
  description: string;
  notes?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  dueDate?: string;
  completedAt?: string;
  assignedTo?: string[];
  createdAt: Date;
  priority?: 'low' | 'medium' | 'high';
};

type Project = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  members: string[];
  createdAt: Date;
  owner: string;
  tags?: string[];
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [allUsers, setAllUsers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'members' | 'timeline'>('overview');

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
      setAllUsers(usersSnapshot.docs.map(doc => doc.id));
    };

    fetchProject();
    fetchUsers();

    const unsubscribe = onSnapshot(
      collection(db, "projects", id as string, "tasks"),
      (snapshot) => {
        const updatedTasks = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            description: data.description,
            notes: data.notes,
            status: data.status || 'pending',
            dueDate: data.dueDate,
            completedAt: data.completedAt,
            assignedTo: data.assignedTo || [],
            createdAt: data.createdAt.toDate(),
            priority: data.priority || 'medium'
          } as Task;
        });
        setTasks(updatedTasks);
      }
    );

    return () => unsubscribe();
  }, [id]);

  // Calcular estatísticas do projeto
  const projectStats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    progress: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0,
    overdueTasks: tasks.filter(t => t.dueDate && new Date() > new Date(t.dueDate) && t.status !== 'completed').length,
    highPriorityTasks: tasks.filter(t => t.priority === 'high').length,
  };

  const handleDeleteProject = async () => {
    if (!id) return;
    if (!confirm("Tem certeza que deseja excluir este projeto e todas as suas tarefas?")) return;
    
    try {
      const tasksSnapshot = await getDocs(collection(db, "projects", id as string, "tasks"));
      const deletePromises = tasksSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      await deleteDoc(doc(db, "projects", id as string));
      toast.success("Projeto excluído com sucesso!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Erro ao excluir projeto");
      console.error("Error deleting project:", error);
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: Task['status']) => {
    if (!id) return;
    
    try {
      const taskRef = doc(db, "projects", id as string, "tasks", taskId);
      const taskData = tasks.find(t => t.id === taskId);
      
      if (!taskData) return;

      const updates: Partial<Task> = { status: newStatus };

      if (newStatus === 'completed') {
        updates.completedAt = new Date().toISOString();
        
        if (taskData.dueDate && new Date() > new Date(taskData.dueDate)) {
          toast.warning("Tarefa concluída após o prazo!");
          updates.status = 'overdue';
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
        {/* Cabeçalho do Projeto */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">{project.title}</h1>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
              <FiCalendar className="mr-1" />
              <span>
                {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/dashboard/projects/edit/${id}`}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              <FiEdit size={16} />
              Editar Projeto
            </Link>
            <button
              onClick={handleDeleteProject}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition"
            >
              <FiTrash2 size={16} />
              Excluir
            </button>
          </div>
        </div>

        {/* Barra de navegação */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <FiPieChart size={16} />
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'tasks' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <FiList size={16} />
              Tarefas ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'members' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <FiUser size={16} />
              Membros ({project.members.length})
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'timeline' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <FiClock size={16} />
              Cronograma
            </button>
          </nav>
        </div>

        {/* Conteúdo principal baseado na aba ativa */}
        <div className="mb-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Estatísticas do projeto */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total de Tarefas</h3>
                  <p className="text-2xl font-bold dark:text-white">{projectStats.totalTasks}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Concluídas</h3>
                  <p className="text-2xl font-bold dark:text-white">{projectStats.completedTasks}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Atrasadas</h3>
                  <p className="text-2xl font-bold dark:text-white">{projectStats.overdueTasks}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Prioridade Alta</h3>
                  <p className="text-2xl font-bold dark:text-white">{projectStats.highPriorityTasks}</p>
                </div>
              </div>

              {/* Progresso */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4 dark:text-white">Progresso do Projeto</h2>
                <ProgressBar value={projectStats.progress} />
                <div className="mt-2 flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{projectStats.progress}% completo</span>
                  <span>{projectStats.completedTasks} de {projectStats.totalTasks} tarefas</span>
                </div>
              </div>

              {/* Descrição do Projeto */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4 dark:text-white">Descrição do Projeto</h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{project.description}</p>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold dark:text-white">Tarefas do Projeto</h2>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <FiPlus size={16} />
                  Nova Tarefa
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['pending', 'in_progress', 'completed'].map((status) => (
                  <TaskColumn
                    key={status}
                    status={status as Task['status']}
                    tasks={tasks.filter(t => t.status === status)}
                    onTaskClick={openTaskDetails}
                    onStatusChange={handleTaskStatusChange}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold dark:text-white">Membros da Equipe</h2>
                <button
                  onClick={() => {}}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <FiPlus size={16} />
                  Adicionar Membro
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {project.members.map(memberId => (
                    <div key={memberId} className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                        <FiUser className="text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-medium dark:text-white">{memberId}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Membro</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold dark:text-white">Cronograma do Projeto</h2>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium dark:text-white">Datas Importantes</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-3">
                      <FiCalendar />
                    </div>
                    <div>
                      <h4 className="font-medium dark:text-white">Início do Projeto</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(project.startDate).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mr-3">
                      <FiCalendar />
                    </div>
                    <div>
                      <h4 className="font-medium dark:text-white">Prazo Final</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(project.endDate).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h3 className="font-medium mb-4 dark:text-white">Tarefas com Prazo</h3>
                {tasks.filter(t => t.dueDate).length > 0 ? (
                  <div className="space-y-3">
                    {tasks
                      .filter(t => t.dueDate)
                      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
                      .map(task => (
                        <div key={task.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div>
                            <h4 className="font-medium dark:text-white">{task.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Prazo: {new Date(task.dueDate!).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            new Date() > new Date(task.dueDate!) ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {task.status === 'completed' ? 'Concluída' : new Date() > new Date(task.dueDate!) ? 'Atrasada' : 'Pendente'}
                          </span>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Nenhuma tarefa com prazo definido</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal de Tarefa */}
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

// Componente de Coluna de Tarefas
const TaskColumn = ({
  status,
  tasks,
  onTaskClick,
  onStatusChange
}: {
  status: Task['status'];
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "TASK",
    drop: (item: { id: string }) => onStatusChange(item.id, status),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const dropRef = useRef<HTMLDivElement>(null);
  drop(dropRef);
  const statusConfig = {
    pending: { title: "Pendente", color: "bg-gray-200 dark:bg-gray-700" },
    in_progress: { title: "Em Progresso", color: "bg-blue-200 dark:bg-blue-900/30" },
    completed: { title: "Concluído", color: "bg-green-200 dark:bg-green-900/30" },
    overdue: { title: "Atrasado", color: "bg-red-200 dark:bg-red-900/30" }
  };

  return (
    <div
      ref={dropRef}
      className={`rounded-lg p-4 ${isOver ? 'bg-opacity-70' : ''} ${statusConfig[status].color}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">{statusConfig[status].title}</h3>
        <span className="text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center text-gray-500 py-4">Nenhuma tarefa</div>
        ) : (
          tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Componente de Card de Tarefa
const TaskCard = ({
  task,
  onClick,
  onStatusChange
}: {
  task: Task;
  onClick: () => void;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "TASK",
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const dragRef = useRef<HTMLDivElement>(null);
  drag(dragRef);

  const isOverdue = task.dueDate && new Date() > new Date(task.dueDate) && task.status !== 'completed';

  return (
    <motion.div
      ref={dragRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onClick={onClick}
      className={`p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer transition ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      } ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-medium">{task.title}</h4>
        {isOverdue && (
          <span className="flex items-center text-xs text-red-500">
            <FiAlertTriangle className="mr-1" /> Atrasada
          </span>
        )}
      </div>
      {task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
          {task.description}
        </p>
      )}
      {task.dueDate && (
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
          <FiCalendar className="mr-1" size={12} />
          <span>Prazo: {new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
      )}
      {task.assignedTo && task.assignedTo.length > 0 && (
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
          <FiUser className="mr-1" size={12} />
          <span>{task.assignedTo.length} responsável(is)</span>
        </div>
      )}
    </motion.div>
  );
};