"use client";
import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, Timestamp, serverTimestamp, getDocs, query, where, collection, addDoc } from "firebase/firestore";
import { db, auth } from "@/firebase/config";
import { useRouter, useParams } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "sonner";
import { FiUser, FiCalendar, FiFileText, FiSave } from "react-icons/fi";
import { X } from "lucide-react";
import { getAuth, fetchSignInMethodsForEmail } from "firebase/auth";
import { useDebounce } from "use-debounce";

// Tipos para o projeto, alinhado com DashboardPage.tsx
type ProjectData = {
  id?: string;
  title: string;
  description: string;
  status: "TO_DO" | "IN_PROGRESS" | "DONE";
  priority: "low" | "medium" | "high";
  createdAt?: Date | Timestamp;
  startDate?: string;
  endDate?: string;
  owner: string;
  members: string[];
};

export default function ProjectEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, loadingAuth] = useAuthState(auth);
  const [formData, setFormData] = useState<ProjectData>({
    title: "",
    description: "",
    status: "TO_DO",
    priority: "medium",
    owner: "",
    members: [],
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailInput, setEmailInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedEmailInput] = useDebounce(emailInput, 500);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loadingAuth && !user) {
      router.push("/auth/login");
    } else if (user) {
      setFormData((prev) => ({ ...prev, owner: user.uid }));
    }
  }, [user, loadingAuth, router]);

  // Carregar dados do projeto para edição
  useEffect(() => {
    if (!id || !user) {
      toast.error("ID do projeto ou usuário não fornecido");
      router.push("/dashboard");
      return;
    }

    const fetchProject = async () => {
      try {
        const docRef = doc(db, "projects", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const projectData = docSnap.data() as ProjectData;
          const parseDate = (date: any): string | undefined => {
            if (!date) return undefined;
            if (date instanceof Timestamp) return date.toDate().toISOString().split("T")[0];
            if (typeof date === "string" && date) return date;
            return undefined;
          };
          setFormData({
            id: docSnap.id,
            title: projectData.title || "",
            description: projectData.description || "",
            status: ["TO_DO", "IN_PROGRESS", "DONE"].includes(projectData.status) ? projectData.status : "TO_DO",
            priority: ["low", "medium", "high"].includes(projectData.priority) ? projectData.priority : "medium",
            createdAt: projectData.createdAt,
            startDate: parseDate(projectData.startDate),
            endDate: parseDate(projectData.endDate),
            owner: projectData.owner || user.uid,
            members: projectData.members || [],
          });
        } else {
          toast.error("Projeto não encontrado");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        toast.error("Erro ao carregar projeto");
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, user, router]);

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
      const authInstance = getAuth();
      let userExists = false;

      // Verificar se existe no Auth
      const signInMethods = await fetchSignInMethodsForEmail(authInstance, email);
      if (signInMethods.length > 0) {
        userExists = true;
      }

      // Verificar se existe na coleção "users"
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
    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m !== email),
    }));
    toast.success(`Usuário ${email} removido`);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Título é obrigatório";
    }

    if (formData.startDate && isNaN(new Date(formData.startDate).getTime())) {
      newErrors.startDate = "Data de início inválida";
    }

    if (formData.endDate && isNaN(new Date(formData.endDate).getTime())) {
      newErrors.endDate = "Data de término inválida";
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start > end) {
        newErrors.endDate = "Data de término deve ser após a data de início";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createNotifications = async (projectId: string, members: string[]) => {
    const notificationPromises = members
      .filter((email) => email !== user?.email)
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
        priority: formData.priority || "medium",
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, "projects", id as string), projectData);
      toast.success("Projeto atualizado com sucesso!");

      // Enviar notificações para membros adicionados
      if (formData.members.length > 0) {
        await createNotifications(id as string, formData.members);
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Erro ao atualizar projeto");
    } finally {
      setLoading(false);
    }
  };

  if (loading || loadingAuth) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
        aria-labelledby="form-title"
      >
        <h1
          id="form-title"
          className="text-2xl font-bold text-center text-primary dark:text-primary-300 mb-6 flex items-center justify-center gap-2"
        >
          <FiSave className="inline" />
          Editar Projeto
        </h1>

        <div className="space-y-6">
          {/* Título */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título do Projeto <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              className={`w-full rounded-lg border ${
                errors.title ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              } p-3 focus:ring-2 focus:ring-primary focus:outline-none dark:bg-gray-700 dark:text-white`}
              placeholder="Ex: Sistema de Gestão de Tarefas"
            />
            {errors.title && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.title}</p>}
          </div>

          {/* Descrição */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"
            >
              <FiFileText size={16} />
              Descrição
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 focus:ring-2 focus:ring-primary focus:outline-none dark:bg-gray-700 dark:text-white"
              placeholder="Descreva os objetivos, escopo e detalhes importantes do projeto"
            />
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status do Projeto <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={handleChange}
              className={`w-full rounded-lg border ${
                errors.status ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              } p-3 focus:ring-2 focus:ring-primary focus:outline-none dark:bg-gray-700 dark:text-white`}
            >
              <option value="TO_DO">Por Fazer</option>
              <option value="IN_PROGRESS">Em Progresso</option>
              <option value="DONE">Concluído</option>
            </select>
            {errors.status && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.status}</p>}
          </div>

          {/* Prioridade */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prioridade do Projeto <span className="text-red-500">*</span>
            </label>
            <select
              id="priority"
              value={formData.priority || "medium"}
              onChange={handleChange}
              className={`w-full rounded-lg border ${
                errors.priority ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              } p-3 focus:ring-2 focus:ring-primary focus:outline-none dark:bg-gray-700 dark:text-white`}
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
            {errors.priority && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.priority}</p>}
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"
              >
                <FiCalendar size={16} />
                Data de Início
              </label>
              <input
                id="startDate"
                type="date"
                value={formData.startDate || ""}
                onChange={handleChange}
                className={`w-full rounded-lg border ${
                  errors.startDate ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } p-3 focus:ring-2 focus:ring-primary focus:outline-none dark:bg-gray-700 dark:text-white`}
              />
              {errors.startDate && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.startDate}</p>}
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"
              >
                <FiCalendar size={16} />
                Data de Término
              </label>
              <input
                id="endDate"
                type="date"
                value={formData.endDate || ""}
                onChange={handleChange}
                min={formData.startDate || ""}
                className={`w-full rounded-lg border ${
                  errors.endDate ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } p-3 focus:ring-2 focus:ring-primary focus:outline-none dark:bg-gray-700 dark:text-white`}
              />
              {errors.endDate && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.endDate}</p>}
            </div>
          </div>

          {/* Membros */}
          <div>
            <label
              htmlFor="members"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"
            >
              <FiUser size={16} />
              Membros da Equipe
            </label>
            <div className="flex gap-2">
              <input
                id="members"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Digite o email do membro"
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 p-3 focus:ring-2 focus:ring-primary focus:outline-none dark:bg-gray-700 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddMember}
                disabled={isSearching}
                className="px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSearching ? "Verificando..." : "Adicionar"}
              </button>
            </div>
            {formData.members.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Membros adicionados:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.members.map((member, index) => (
                    <div
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm flex items-center"
                    >
                      {member}
                      <button
                        type="button"
                        onClick={() => removeMember(member)}
                        className="ml-2 text-blue-500 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Digite um email por vez e clique em "Adicionar". Membros adicionados: {formData.members.length}
            </p>
          </div>

          {/* Botão de submit */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition font-medium disabled:opacity-70"
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin">↻</span>
                  Salvando...
                </>
              ) : (
                <>
                  <FiSave size={18} />
                  Salvar Projeto
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}