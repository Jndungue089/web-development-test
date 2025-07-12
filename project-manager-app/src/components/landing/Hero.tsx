"use client";
import { motion } from "framer-motion";
import { FiArrowRight, FiCheck, FiBarChart2 } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { BackgroundGrid } from "../extras/BackgroundGrid";

export function HeroSection() {
  const router = useRouter();

  return (
    <>
    <section id="hero" className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-20 px-4 sm:px-6 lg:px-8">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5">
        <div className="absolute top-0 left-20 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl dark:bg-blue-600"></div>
        <div className="absolute bottom-0 right-20 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl dark:bg-blue-700"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center">
                  <BackgroundGrid />

          {/* Título principal */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
          >
            Gerencie projetos com <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
              simplicidade e poder
            </span>
          </motion.h1>

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10"
          >
            O PMS combina ferramentas avançadas com uma interface intuitiva para transformar sua produtividade.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <button
            data-testid="cta-signup"
              onClick={() => router.push("/auth/register")}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg hover:shadow-blue-500/20 flex items-center justify-center"
            >
              Comece gratuitamente <FiArrowRight className="ml-2" />
            </button>
          
          </motion.div>

          {/* Destaques */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-12 flex flex-wrap justify-center gap-4 text-sm text-gray-500 dark:text-gray-400"
          >
            <div className="flex items-center">
              <FiCheck className="mr-1 text-green-500" /> Sem cartão necessário
            </div>
            <div className="flex items-center">
              <FiCheck className="mr-1 text-green-500" /> Configuração em 2 minutos
            </div>
            <div className="flex items-center">
              <FiCheck className="mr-1 text-green-500" /> Suporte 24/7
            </div>
          </motion.div>
        </div>

        {/* App Mockup */}
        <motion.div
        data-testid="hero-mockup"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mt-16 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
        >
          <div className="aspect-video bg-gradient-to-br from-blue-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mx-auto mb-6">
                <FiBarChart2 className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2"
              data-testid="mockup-title">
                Dashboard PMS
              </h3>
              <p className="text-gray-500 dark:text-gray-400"
              data-testid="mockup-subtitle">
                Visualização do painel de controle
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section></>
  );
}