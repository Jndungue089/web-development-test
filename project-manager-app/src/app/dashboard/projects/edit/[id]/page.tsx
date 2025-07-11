"use client";
import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, Timestamp, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { FiUser, FiCalendar, FiFileText, FiSave, FiTag } from "react-icons/fi";

type Project = {
  id: string;
  title: string;
  description: string;
  startDate: string | Timestamp;
  endDate: string | Timestamp;
  members: string[];
  createdAt: Date | Timestamp;
  owner: string;
  tags?: string[];
  status: "TO_DO" | "IN_PROGRESS" | "DONE";
  priority: "low" | "medium" | "high";
};

type ProjectData = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  members: string[];
  tags: string[];
  status: "TO_DO" | "IN_PROGRESS" | "DONE";
  priority: "low" | "medium" | "high";
};

export default function ProjectEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState<ProjectData>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    members: [],
    tags: [],
    status: "TO_DO",
    priority: "medium",
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [membersInput, setMembersInput] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  // Carregar dados do projeto para edição
  useEffect(() => {
    if (!id) {
      toast.error("ID do projeto não fornecido");
      router.push("/dashboard");
      return;
    }

    const fetchProject = async () => {
      try {
        const docRef = doc(db, "projects", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const projectData = docSnap.data() as Project;
          const parseDate = (date: string | Timestamp | undefined): string => {
            if (!date) return "";
            if (date instanceof Timestamp) {
              return date.toDate().toISOString().split("T")[0];
            }
            return date;
          };

          setFormData({
            title: projectData.title || "",
            description: projectData.description || "",
            startDate: parseDate(projectData.startDate),
            endDate: parseDate(projectData.endDate),
            members: projectData.members || [],
            tags: projectData.tags || [],
            status: ["TO_DO", "IN_PROGRESS", "DONE"].includes(projectData.status) ? projectData.status : "TO_DO",
            priority: ["low", "medium", "high"].includes(projectData.priority) ? projectData.priority : "medium",
          });
          setMembersInput(projectData.members?.join(", ") || "");
          setTagsInput(projectData.tags?.join(", ") || "");
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
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const handleMembersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMembersInput(value);

    const membersArray = value
      .split(",")
      .map((m) => m.trim())
      .filter((m) => m !== "");

    setFormData((prev) => ({ ...prev, members: membersArray }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagsInput(value);

    const tagsArray = value
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");

    setFormData((prev) => ({ ...prev, tags: tagsArray }));
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

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = "Data de término deve ser após a data de início";
    }

    if (!formData.status) {
      newErrors.status = "Status é obrigatório";
    }

    if (!formData.priority) {
      newErrors.priority = "Prioridade é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        tags: formData.tags,
        status: formData.status,
        priority: formData.priority,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, "projects", id as string), projectData);
      toast.success("Projeto atualizado com sucesso!");
      router.push(`/dashboard/projects/${id}`);
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Erro ao atualizar projeto");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
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
              value={formData.priority}
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
                value={formData.startDate}
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
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate}
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
            <input
              id="members"
              type="text"
              value={membersInput}
              onChange={handleMembersChange}
              placeholder="Ex: joao@empresa.com, maria@empresa.com"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 focus:ring-2 focus:ring-primary focus:outline-none dark:bg-gray-700 dark:text-white"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.members.map((member, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                  {member}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Separe os e-mails por vírgulas. Membros adicionados: {formData.members.length}
            </p>
          </div>

          {/* Tags */}
          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"
            >
              <FiTag size={16} />
              Tags
            </label>
            <input
              id="tags"
              type="text"
              value={tagsInput}
              onChange={handleTagsChange}
              placeholder="Ex: desenvolvimento, urgente, frontend"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 focus:ring-2 focus:ring-primary focus:outline-none dark:bg-gray-700 dark:text-white"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Separe as tags por vírgulas. Tags adicionadas: {formData.tags.length}
            </p>
          </div>

          {/* Botão de submit */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push(`/dashboard/projects/${id}`)}
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