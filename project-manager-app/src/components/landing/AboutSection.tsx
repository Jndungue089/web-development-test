"use client";
import { motion } from "framer-motion";
import { FiCheck, FiUsers, FiCalendar, FiBell, FiLock, FiDatabase, FiCode } from "react-icons/fi";

export function AboutSection() {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Sobre o PMS</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Uma solução completa para gerenciamento de projetos com foco em produtividade e colaboração
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
              Transformando a gestão de projetos
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              O PMS (Project Management System) é uma aplicação moderna desenvolvida para simplificar e otimizar o gerenciamento de projetos. Com interface intuitiva e funcionalidades avançadas, nossa plataforma permite que equipes criem, organizem, colaborem e monitorem o progresso de projetos de forma eficaz.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Desenvolvido com React.js e Next.js, o PMS oferece uma experiência fluida tanto para gestores quanto para membros de equipe, com recursos poderosos de acompanhamento de tarefas, prazos e colaboração em tempo real.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <FiCheck className="text-green-500 mt-1 mr-3 flex-shrink-0" size={18} />
                <span className="text-gray-700 dark:text-gray-300">Interface intuitiva e fácil de usar</span>
              </div>
              <div className="flex items-start">
                <FiCheck className="text-green-500 mt-1 mr-3 flex-shrink-0" size={18} />
                <span className="text-gray-700 dark:text-gray-300">Colaboração em tempo real entre equipes</span>
              </div>
              <div className="flex items-start">
                <FiCheck className="text-green-500 mt-1 mr-3 flex-shrink-0" size={18} />
                <span className="text-gray-700 dark:text-gray-300">Acompanhamento detalhado de progresso</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                    <feature.icon className="text-blue-600 dark:text-blue-400" size={18} />
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">{feature.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: FiUsers,
    title: "Gestão de Equipes",
    description: "Atribua membros a projetos e defina permissões específicas para cada colaborador."
  },
  {
    icon: FiCalendar,
    title: "Controle de Prazos",
    description: "Defina datas importantes e receba alertas sobre tarefas próximas do vencimento."
  },
  {
    icon: FiBell,
    title: "Sistema de Notificações",
    description: "Mantenha-se atualizado com alertas sobre mudanças e prazos importantes."
  },
  {
    icon: FiLock,
    title: "Autenticação Segura",
    description: "Sistema de login protegido com Firebase Authentication para maior segurança."
  },
  {
    icon: FiDatabase,
    title: "Persistência de Dados",
    description: "Todos os dados armazenados no Firestore para acesso rápido e confiável."
  },
  {
    icon: FiCode,
    title: "Tecnologia Moderna",
    description: "Desenvolvido com Next.js e React para performance e experiência do usuário excepcionais."
  }
];  