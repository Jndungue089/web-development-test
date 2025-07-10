"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/firebase/config";
import { useRouter } from "next/navigation";
import Header from "@/components/dashboard/Header";
import { toast } from "sonner";
import { FiLogOut } from "react-icons/fi";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<null | { displayName?: string | null; email?: string | null }>(null);
  const router = useRouter();

  // Determine greeting based on current time (WAT, July 10, 2025, 06:18 PM)
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12
    ? "Bom dia"
    : currentHour < 18
    ? "Boa tarde"
    : "Boa noite";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/auth");
        toast.error("Sessão expirada. Faça login novamente.");
      } else {
        setUser({
          displayName: currentUser.displayName,
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
      router.push("/auth");
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
      <Header onUserMenu={() => handleSignOut()} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {greeting}, {user?.displayName || user?.email?.split("@")[0] || "Usuário"}!
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
          {children}
        </main>
      </div>
    </div>
  );
}