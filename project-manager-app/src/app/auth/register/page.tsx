"use client";
import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "@/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiUser, FiArrowRight, FiAlertCircle, FiLoader, FiGrid } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Criar usuário com email e senha
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Salvar informações adicionais no Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: name,
        email: email,
        createdAt: new Date().toISOString(),
      });

      router.push("/dashboard");
    } catch (err) {
      console.error("Erro no registro:", err);
      setError("Ocorreu um erro ao criar a conta. Por favor, tente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());

      // Se for um novo usuário via Google, salve os dados
      if (result.user.metadata.creationTime === result.user.metadata.lastSignInTime) {
        await setDoc(doc(db, "users", result.user.uid), {
          name: result.user.displayName || "",
          email: result.user.email || "",
          createdAt: new Date().toISOString(),
        });
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Erro no login com Google:", err);
      setError("Ocorreu um erro ao acessar com Google. Por favor, tente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="w-full max-w-md">
          {/* Logo PMS */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <FiGrid className="text-white" size={20} />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">PMS</span>
            </div>
          </div>

          {/* Card de Registro */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Criar nova conta
              </h2>

              {/* Formulário */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Campo Nome */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="text-gray-400" size={18} />
                    </div>
                    <input
                      id="name"
                      type="text"
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      required />
                  </div>
                </div>

                {/* Campo Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="text-gray-400" size={18} />
                    </div>
                    <input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      required />
                  </div>
                </div>

                {/* Campo Senha */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-gray-400" size={18} />
                    </div>
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                      minLength={6} />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Mínimo de 6 caracteres
                  </p>
                </div>

                {/* Mensagem de Erro */}
                {error && (
                  <div className="flex items-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                    <FiAlertCircle className="mr-2" size={18} />
                    {error}
                  </div>
                )}

                {/* Botão de Registro */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <FiLoader className="animate-spin mr-2" size={18} />
                      Criando conta...
                    </>
                  ) : (
                    <>
                      Criar Conta <FiArrowRight className="ml-2" size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Divisor */}
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-gray-300 dark:border-gray-700"></div>
                <span className="px-3 text-gray-500 dark:text-gray-400 text-sm">ou</span>
                <div className="flex-1 border-t border-gray-300 dark:border-gray-700"></div>
              </div>

              {/* Registro com Google */}
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-70"
              >
                <FcGoogle className="mr-2" size={20} />
                Continuar com Google
              </button>

              {/* Link para Login */}
              <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Já tem uma conta?{" "}
                <Link
                  href="/auth/login"
                  className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                >
                  Faça login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div></>
  );
}