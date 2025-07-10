"use client";
import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CreateProjectPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [members, setMembers] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await addDoc(collection(db, "projects"), {
        title,
        description,
        startDate: startDate || null,
        endDate: endDate || null,
        members: members.split(",").map((m) => m.trim()) || [],
        status: "TO_DO",
        createdAt: new Date(),
      });
      toast.success("Projeto criado com sucesso!");
      router.push("/dashboard");
    } catch (err: any) {
      setError("Erro ao criar projeto: " + err.message);
      toast.error("Erro ao criar projeto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md bg-white p-6 md:p-8 rounded-2xl shadow-lg border justify-center items-center border-gray-200"
      aria-labelledby="form-title"
    >
      <h1 id="form-title" className="text-2xl font-bold text-center text-primary mb-6">
        Criar Novo Projeto
      </h1>

      <div className="space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Título do Projeto <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-primary focus:outline-none p-3"
            placeholder="Ex: Sistema de Gestão de Tarefas"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Descrição
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-primary focus:outline-none p-3"
            placeholder="Descreva brevemente o projeto"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Início
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-primary focus:outline-none p-3"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              Conclusão
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-primary focus:outline-none p-3"
            />
          </div>
        </div>

        <div>
          <label htmlFor="members" className="block text-sm font-medium text-gray-700">
            Membros
          </label>
          <input
            id="members"
            type="text"
            value={members}
            onChange={(e) => setMembers(e.target.value)}
            placeholder="Ex: João, Maria"
            className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-primary focus:outline-none p-3"
          />
          <p className="text-xs text-gray-500 mt-1">Separe os nomes por vírgulas</p>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg text-white font-semibold transition-all bg-primary hover:bg-primary-dark disabled:bg-gray-300"
        >
          {loading ? "Salvando..." : "Criar Projeto"}
        </button>
      </div>
    </form>
  );
}
