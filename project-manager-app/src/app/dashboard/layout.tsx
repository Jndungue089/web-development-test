"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/firebase/config";
import { useRouter, usePathname } from "next/navigation";
import Header from "@/components/dashboard/Header";
import { toast } from "sonner";
import { addDoc, collection, onSnapshot, serverTimestamp } from "@firebase/firestore";
import { set } from "react-hook-form";
import { Button } from "@/components/ui/button";
import ToastProvider from "@/components/ToastProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<null | { name?: string | null; email?: string | null }>(null);
  const [back, setBack] = useState(false);
  const router = useRouter();
  const otherRouter = usePathname();



  useEffect(() => {
    if (!user || loading) return;

    const membersCache = new Map<string, string[]>();

    const createNotifications = async (projectId: string, members: string[], name: string) => {
      const notificationPromises = members
        .filter(email => email !== user?.email)
        .map(async (email) => {
          try {
            await addDoc(collection(db, "notifications"), {
              projectId,
              recipientEmail: email,
              read: false,
              message: `Você foi adicionado ao projeto "${name}"`,
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

    const unsubscribe = onSnapshot(collection(db, "projects"), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "modified") {
          const doc = change.doc;
          const data = doc.data();
          const projectId = doc.id;

          const newMembers: string[] = data.members || [];
          const oldMembers: string[] = membersCache.get(projectId) || [];

          const addedMembers = newMembers.filter((email) => !oldMembers.includes(email));
          if (addedMembers.length > 0) {
            createNotifications(projectId, addedMembers, data.title);
          }

          membersCache.set(projectId, newMembers);
        }
      });
    });

    return () => unsubscribe();
  }, [user, loading]);

  // Determine greeting based on current time (WAT, July 10, 2025, 06:18 PM)
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12
    ? "Bom dia"
    : currentHour < 18
      ? "Boa tarde"
      : "Boa noite";

    useEffect(() => {
          if (otherRouter === "/dashboard") {
      setBack(false);
    }
    if (otherRouter !== "/dashboard") {
      setBack(true);
    }}, [otherRouter]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/auth/login");
        toast.error("Sessão expirada. Faça login novamente.");
      } else {
        setUser({
          name: currentUser.displayName,
          email: currentUser.email,
        });
        setLoading(false);
        toast.success(`Bem-vindo(a), ${currentUser.displayName || currentUser.email?.split("@")[0] || "Usuário"}!`);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/auth/login");
      toast.info("Você saiu com sucesso.");
    } catch (error) {
      toast.error("Erro ao sair. Tente novamente.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 antialiased">
        <header className="w-full flex items-center justify-between px-6 py-3 bg-white shadow-sm mb-6 animate-pulse">
          <div className="h-6 w-40 bg-gray-300 dark:bg-gray-700 rounded" />
          <div className="flex items-center gap-6">
            <div className="h-6 w-6 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded" />
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <div className="h-8 w-64 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-2" />
            <div className="h-4 w-80 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <main className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="h-48 w-full bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 antialiased">
      <ToastProvider />
      <Header onUserMenu={() => handleSignOut()} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {greeting}, {user?.name || user?.email?.split("@")[0] || "Usuário"}!
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gerencie seus projetos com eficiência - {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <main className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          {back && (
            <Button
              variant="outline"
              className="mb-4"
              onClick={() => router.back()}
            >
              Voltar
            </Button>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}