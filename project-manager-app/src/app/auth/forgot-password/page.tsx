"use client";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase/config";
import { useRouter } from "next/navigation";
import { FiMail, FiArrowRight, FiCheckCircle, FiAlertCircle, FiLoader } from "react-icons/fi";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            await sendPasswordResetEmail(auth, email);
            setSuccess(true);
        } catch (err: any) {
            console.error("Erro ao enviar email de recuperação:", err);
            setError("Ocorreu um erro ao enviar o email. Verifique o endereço e tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
                <div className="w-full max-w-md">
                    {/* Card de Recuperação */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 p-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                            Recuperar Senha
                        </h2>

                        {success ? (
                            <div className="text-center space-y-6">
                                <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                    <FiCheckCircle size={32} />
                                </div>
                                <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                                    Email enviado com sucesso!
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Enviamos um link de recuperação para <span className="font-medium">{email}</span>.
                                    Verifique sua caixa de entrada e siga as instruções.
                                </p>
                                <button
                                    onClick={() => router.push("/auth/login")}
                                    className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                                >
                                    Voltar para o Login <FiArrowRight className="ml-2" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
                                    Digite seu email para receber um link de recuperação de senha.
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-6">
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

                                    {/* Mensagem de Erro */}
                                    {error && (
                                        <div className="flex items-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                                            <FiAlertCircle className="mr-2" size={18} />
                                            {error}
                                        </div>
                                    )}

                                    {/* Botão de Envio */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-70"
                                    >
                                        {loading ? (
                                            <>
                                                <FiLoader className="animate-spin mr-2" size={18} />
                                                Enviando...
                                            </>
                                        ) : (
                                            <>
                                                Enviar Link <FiArrowRight className="ml-2" size={18} />
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Link para Login */}
                                <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                                    Lembrou sua senha?{" "}
                                    <Link
                                        href="/auth/login"
                                        className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                                    >
                                        Faça login
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div></>
    );
}