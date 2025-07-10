"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, deleteDoc, collection, addDoc, getDocs, onSnapshot, QuerySnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/firebase/config";
import TaskItem from "./TaskItem";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const docRef = doc(db, "projects", id as string);
    getDoc(docRef).then(docSnap => {
      if (docSnap.exists()) {
        setProject({ id: docSnap.id, ...docSnap.data() });
        setTitle(docSnap.data().title || "");
        setDescription(docSnap.data().description || "");
      }
      setLoading(false);
    });
    // Listen for real-time updates on tasks
    const unsub = onSnapshot(
      collection(db, "projects", id as string, "tasks"),
      (snapshot: QuerySnapshot<DocumentData>) => {
        setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    );
    return () => unsub();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await updateDoc(doc(db, "projects", id as string), { title, description });
      setEditMode(false);
      setProject((p: any) => ({ ...p, title, description }));
    } catch (err: any) {
      setError("Erro ao atualizar: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("Tem certeza que deseja excluir este projeto?")) return;
    await deleteDoc(doc(db, "projects", id as string));
    router.push("/dashboard");
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !taskTitle) return;
    await addDoc(collection(db, "projects", id as string, "tasks"), {
      title: taskTitle,
      description: taskDesc,
      status: "pendente",
      createdAt: new Date(),
    });
    setTaskTitle("");
    setTaskDesc("");
    // reload tasks
    const tasksSnap = await getDocs(collection(db, "projects", id as string, "tasks"));
    setTasks(tasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  if (loading) return <div className="p-8">Carregando...</div>;
  if (!project) return <div className="p-8">Projeto não encontrado.</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Detalhes do Projeto</h1>
        <button onClick={handleDelete} className="text-red-600 hover:underline">Excluir</button>
      </div>
      {editMode ? (
        <form onSubmit={handleUpdate} className="mb-6">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full p-2 mb-2 border rounded"
            required
          />
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full p-2 mb-2 border rounded"
          />
          {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded mr-2">Salvar</button>
          <button type="button" onClick={() => setEditMode(false)} className="px-4 py-2 rounded border">Cancelar</button>
        </form>
      ) : (
        <div className="mb-6">
          <div className="font-semibold text-lg mb-1">{project.title}</div>
          <div className="text-gray-600 mb-2">{project.description}</div>
          <button onClick={() => setEditMode(true)} className="text-blue-600 hover:underline text-sm">Editar</button>
        </div>
      )}
      <h2 className="text-xl font-bold mb-2">Tarefas</h2>
      <form onSubmit={handleAddTask} className="mb-4 flex gap-2 flex-col sm:flex-row">
        <input
          type="text"
          placeholder="Título da tarefa"
          value={taskTitle}
          onChange={e => setTaskTitle(e.target.value)}
          className="p-2 border rounded flex-1"
          required
        />
        <input
          type="text"
          placeholder="Descrição"
          value={taskDesc}
          onChange={e => setTaskDesc(e.target.value)}
          className="p-2 border rounded flex-1"
        />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Adicionar</button>
      </form>
      <ul className="space-y-2">
        {tasks.length === 0 ? (
          <li className="text-gray-500">Nenhuma tarefa.</li>
        ) : (
          tasks.map(task => (
            <TaskItem
              key={task.id}
              projectId={project.id}
              task={task}
              onStatusChange={async () => {
                const tasksSnap = await getDocs(collection(db, "projects", id as string, "tasks"));
                setTasks(tasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
              }}
              onDelete={async () => {
                const tasksSnap = await getDocs(collection(db, "projects", id as string, "tasks"));
                setTasks(tasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
              }}
            />
          ))
        )}
      </ul>
    </div>
  );
}
