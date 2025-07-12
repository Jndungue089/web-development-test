"use client";
import { useState, useEffect } from "react";
import { addDoc, collection, serverTimestamp, doc, updateDoc, getDoc, Timestamp, getDocs, getFirestore, query, where } from "firebase/firestore";
import { db, auth } from "@/firebase/config";
import { useRouter, useParams } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "sonner";
import { FiUser, FiCalendar, FiFileText, FiPlus, FiSave, FiSearch } from "react-icons/fi";
import { getAuth, fetchSignInMethodsForEmail } from "firebase/auth";
import { X } from "lucide-react";

type Project = {
  id?: string;
  title: string;
  description: string;
  startDate: string | Date;
  endDate: string | Date;
  members: string[];
  owner: string;
  status: "TO_DO" | "IN_PROGRESS" | "DONE";
  priority: "low" | "medium" | "high";
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};


export default function ProjectFormPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, loadingAuth] = useAuthState(auth);
  const [formData, setFormData] = useState<Project>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    members: [],
    owner: "",
    status: "TO_DO",
    priority: "medium",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loadingAuth && !user) {
      router.push("/auth/login");
    } else if (user) {
      setFormData((prev) => ({ ...prev, owner: user.uid }));
    }
  }, [user, loadingAuth, router]);

  // Load project data for editing
  useEffect(() => {
    if (id && user) {
      const fetchProject = async () => {
        try {
          const docRef = doc(db, "projects", id as string);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const projectData = docSnap.data() as Project;
            setFormData({
              ...projectData,
              id: docSnap.id,
              title: projectData.title,
              description: projectData.description,
              startDate: projectData.startDate instanceof Timestamp
                ? projectData.startDate.toDate().toISOString().split('T')[0]
                : typeof projectData.startDate === 'string'
                  ? projectData.startDate
                  : '',
              endDate: projectData.endDate instanceof Timestamp
                ? projectData.endDate.toDate().toISOString().split('T')[0]
                : typeof projectData.endDate === 'string'
                  ? projectData.endDate
                  : '',
              members: projectData.members || [],
              owner: projectData.owner || user.uid,
              status: projectData.status || "TO_DO",
              priority: projectData.priority || "medium",
            });
            setIsEditing(true);
          }
        } catch (error) {
          console.error("Error fetching project:", error);
          toast.error("Erro ao carregar projeto");
        }
      };

      fetchProject();
    }
  }, [id, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const handleAddMember = async () => {
  const email = emailInput.trim();
  if (!email) return;

  // Verificar duplicação
  if (formData.members.includes(email)) {
    toast.error("Este email já foi adicionado");
    return;
  }

  // Validar formato do email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    toast.error("Por favor, insira um email válido");
    return;
  }

  setIsSearching(true);

  try {
    const auth = getAuth();
    const db = getFirestore();

    let userExists = false;

    // 🔍 1. Verificar se existe no Auth
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
    if (signInMethods.length > 0) {
      userExists = true;
    }

    // 🔍 2. Verificar se existe na coleção "users"
    if (!userExists) {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        userExists = true;
      }
    }

    if (userExists) {
      setFormData((prev) => ({
        ...prev,
        members: [...prev.members, email],
      }));
      setEmailInput("");
      toast.success(`Usuário ${email} adicionado com sucesso`);
    } else {
      toast.error("Usuário não encontrado");
    }
  } catch (error) {
    console.error("Erro ao verificar o email:", error);
    toast.error("Erro ao verificar o email");
  } finally {
    setIsSearching(false);
  }
};

  const removeMember = (email: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter(m => m !== email)
    }));
    toast.success(`Usuário ${email} removido`);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Título é obrigatório";
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = "Data de término deve ser após a data de início";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createNotifications = async (projectId: string, members: string[]) => {
    const notificationPromises = members
      .filter(email => email !== user?.email)
      .map(async (email) => {
        try {
          await addDoc(collection(db, "notifications"), {
            projectId,
            recipientEmail: email,
            read: false,
            message: `Você foi adicionado ao projeto "${formData.title}"`,
            createdAt: serverTimestamp(),
          });
          toast.success(`Notificação enviada para ${email}`);
        } catch (error) {
          console.error(`Error creating notification for ${email}:`, error);
          toast.error(`Erro ao enviar notificação para ${email}`);
        }
      });

    await Promise.all(notificationPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (!validateForm()) {
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }

    setLoading(true);

    try {
      const projectData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate ? Timestamp.fromDate(new Date(formData.startDate)) : null,
        endDate: formData.endDate ? Timestamp.fromDate(new Date(formData.endDate)) : null,
        members: formData.members,
        owner: user.uid,
        status: formData.status,
        priority: formData.priority,
        updatedAt: serverTimestamp(),
      };

      let projectId = id as string;

      if (isEditing && id) {
        await updateDoc(doc(db, "projects", id as string), projectData);
        toast.success("Projeto atualizado com sucesso!");
      } else {
        const docRef = await addDoc(collection(db, "projects"), {
          ...projectData,
          createdAt: serverTimestamp(),
        });
        projectId = docRef.id;
        toast.success("Projeto criado com sucesso!");
      }

      // Enviar notificações para os membros adicionados
      if (formData.members.length > 0) {
        await createNotifications(projectId, formData.members);
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error(`Erro ao ${isEditing ? "atualizar" : "criar"} projeto`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingAuth) {
    return <div className="text-center py-20">Carregando...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-start md:items-center justify-center bg-gray-50 dark:bg-gray-900 p-2 sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 rounded-lg md:rounded-xl shadow-md md:shadow-lg border border-gray-200 dark:border-gray-700 my-4 md:my-0"
        aria-labelledby="form-title"
      >
        <h1
          id="form-title"
          className="text-xl sm:text-2xl font-bold text-center text-primary dark:text-primary-300 mb-4 md:mb-6 flex items-center justify-center gap-2"
        >
          {isEditing ? (
            <>
              <FiSave className="inline" />
              Editar Projeto
            </>
          ) : (
            <>
              <FiPlus className="inline" />
              Criar Novo Projeto
            </>
          )}
        </h1>

        <div className="space-y-4 md:space-y-6">
          {/* Título */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
              Título do Projeto <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              className={`w-full rounded-lg border ${errors.title ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } p-2 sm:p-3 focus:ring-2 focus:ring-primary focus:outline-none dark:bg-gray-700 dark:text-white`}
              placeholder="Ex: Sistema de Gestão"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>}
          </div>

          {/* Descrição */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2 flex items-center gap-2"
            >
              <FiFileText size={16} />
              Descrição
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2 sm:p-3 focus:ring-2 focus:ring-primary focus:outline-none dark:bg-gray-700 dark:text-white"
              placeholder="Descreva os objetivos do projeto"
            />
          </div>

          {/* Status e Prioridade em linha em telas maiores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                disabled={!isEditing}
                value={formData.status}
                onChange={handleChange}
                className={`w-full rounded-lg border ${errors.status ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  } p-2 sm:p-3 focus:ring-2 focus:ring-primary focus:outline-none dark:bg-gray-700 dark:text-white`}
              >
                <option value="TO_DO">Por Fazer</option>
                <option value="IN_PROGRESS">Em Progresso</option>
                <option value="DONE">Concluído</option>
              </select>
              {errors.status && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status}</p>}
            </div>

            {/* Prioridade */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                Prioridade <span className="text-red-500">*</span>
              </label>
              <select
                id="priority"
                value={formData.priority || "medium"}
                onChange={handleChange}
                className={`w-full rounded-lg border ${errors.priority ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  } p-2 sm:p-3 focus:ring-2 focus:ring-primary focus:outline-none dark:bg-gray-700 dark:text-white`}
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
              {errors.priority && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.priority}</p>}
            </div>
          </div>

          {/* Datas - Sempre em coluna em mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2 flex items-center gap-2"
              >
                <FiCalendar size={16} />
                Data Início
              </label>
              <input
                id="startDate"
                type="date"
                value={typeof formData.startDate === 'string' ? formData.startDate : ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2 sm:p-3 focus:ring-2 focus:ring-primary focus:outline-none dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2 flex items-center gap-2"
              >
                <FiCalendar size={16} />
                Data Término
              </label>
              <input
                id="endDate"
                type="date"
                value={typeof formData.endDate === 'string' ? formData.endDate : ''}
                onChange={handleChange}
                min={typeof formData.startDate === 'string' ? formData.startDate : ''}
                className={`w-full rounded-lg border ${errors.endDate ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  } p-2 sm:p-3 focus:ring-2 focus:ring-primary focus:outline-none dark:bg-gray-700 dark:text-white`}
              />
              {errors.endDate && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.endDate}</p>}
            </div>
          </div>

          {/* Campo de membros */}
          <div>
            <label
              htmlFor="members"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2 flex items-center gap-2"
            >
              <FiUser size={16} />
              Membros
            </label>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="members"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Email do membro"
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 p-2 sm:p-3 focus:ring-2 focus:ring-primary focus:outline-none dark:bg-gray-700 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddMember}
                disabled={isSearching}
                className="px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSearching ? "Verificando..." : "Adicionar"}
              </button>
            </div>

            {/* Membros adicionados */}
            {formData.members.length > 0 && (
              <div className="mt-2 md:mt-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">Membros:</p>
                <div className="flex flex-wrap gap-1 md:gap-2">
                  {formData.members.map((member, index) => (
                    <div
                      key={index}
                      className="px-2 py-1 text-xs sm:text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full flex items-center"
                    >
                      {member.length > 20 ? `${member.substring(0, 15)}...` : member}
                      <button
                        type="button"
                        onClick={() => removeMember(member)}
                        className="ml-1 text-blue-500 hover:text-blue-700 dark:hover:text-blue-300"
                        aria-label={`Remover ${member}`}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botões de ação - Coluna em mobile */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-2 md:pt-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 sm:px-6 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition font-medium order-2 sm:order-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-1 sm:gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition font-medium disabled:opacity-70 order-1 sm:order-2 mb-2 sm:mb-0"
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin">↻</span>
                  {isEditing ? "Salvando..." : "Criando..."}
                </>
              ) : (
                <>
                  {isEditing ? <FiSave size={16} /> : <FiPlus size={16} />}
                  <span>{isEditing ? "Salvar" : "Criar"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}