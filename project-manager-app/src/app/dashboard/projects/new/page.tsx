"use client";
import { useState, useEffect } from "react";
import { addDoc, collection, serverTimestamp, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { FiUser, FiCalendar, FiFileText, FiPlus, FiSave } from "react-icons/fi";

type ProjectData = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  members: string[];
  status: "TO_DO" | "IN_PROGRESS" | "DONE"; // Update to match Project type
};

export default function ProjectFormPage() {
  const { id } = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState<ProjectData>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    members: [],
    status: "TO_DO", // Default status for new projects
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [membersInput, setMembersInput] = useState("");

  // Verificar se é edição e carregar dados do projeto
  useEffect(() => {
    if (id) {
      const fetchProject = async () => {
        try {
          const docRef = doc(db, "projects", id as string);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const projectData = docSnap.data() as ProjectData;
            setFormData({
              title: projectData.title,
              description: projectData.description,
              startDate: projectData.startDate,
              endDate: projectData.endDate,
              members: projectData.members || [],
              status: projectData.status || "TO_DO", // Fallback to TO_DO if status is invalid
            });
            setMembersInput(projectData.members?.join(", ") || "");
            setIsEditing(true);
          }
        } catch (error) {
          console.error("Error fetching project:", error);
          toast.error("Erro ao carregar projeto");
        }
      };

      fetchProject();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    // Limpar erro quando o usuário digitar
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const handleMembersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMembersInput(value);

    // Atualizar array de membros
    const membersArray = value
      .split(",")
      .map((m) => m.trim())
      .filter((m) => m !== "");

    setFormData((prev) => ({ ...prev, members: membersArray }));
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
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        members: formData.members,
        status: formData.status, // Include status
        updatedAt: serverTimestamp(),
      };

      if (isEditing && id) {
        // Atualizar projeto existente
        await updateDoc(doc(db, "projects", id as string), projectData);
        toast.success("Projeto atualizado com sucesso!");
      } else {
        // Criar novo projeto
        await addDoc(collection(db, "projects"), {
          ...projectData,
          status: "TO_DO", // Set default status for new projects
          createdAt: serverTimestamp(),
        });
        toast.success("Projeto criado com sucesso!");
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error(`Erro ao ${isEditing ? "atualizar" : "criar"} projeto`);
    } finally {
      setLoading(false);
    }
  };

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
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 focus:ring-2 focus:ring-primary focus:outline-none dark:bg-gray-700 dark:text-white"
              />
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

          {/* Botão de submit */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onCancel={() => router.push("/dashboard")}
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
                  {isEditing ? "Salvando..." : "Criando..."}
                </>
              ) : (
                <>
                  {isEditing ? <FiSave size={18} /> : <FiPlus size={18} />}
                  {isEditing ? "Salvar Projeto" : "Criar Projeto"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}