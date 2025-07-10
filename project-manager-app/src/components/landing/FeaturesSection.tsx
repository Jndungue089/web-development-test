"use client";
import { motion } from "framer-motion";
import { FiLayers, FiUsers, FiBarChart2, FiLock, FiCode, FiBell, FiCheck } from "react-icons/fi";

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Recursos Poderosos</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Tudo o que sua equipe precisa para gerenciar projetos com eficiência
          </p>
        </motion.div>

        {/* Grid de Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-6">
                <feature.icon className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{feature.description}</p>
              <ul className="space-y-2">
                {feature.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start">
                    <FiCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" size={16} />
                    <span className="text-gray-700 dark:text-gray-300 text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Destaque Principal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl overflow-hidden shadow-xl"
        >
          <div className="p-8 md:p-12 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h3 className="text-2xl font-bold text-white mb-4">Dashboard Intuitivo</h3>
              <p className="text-blue-100 mb-6">
                Visualize o progresso de todos os seus projetos em um único lugar com nosso painel de controle personalizável.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="bg-blue-700 bg-opacity-50 px-3 py-1 rounded-full text-sm text-white">Tempo Real</div>
                <div className="bg-blue-700 bg-opacity-50 px-3 py-1 rounded-full text-sm text-white">Personalizável</div>
                <div className="bg-blue-700 bg-opacity-50 px-3 py-1 rounded-full text-sm text-white">Responsivo</div>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg h-48 flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">Visualização do Dashboard</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: FiLayers,
    title: "Gestão de Projetos",
    description: "Organize todos os seus projetos em um só lugar com visualizações personalizadas.",
    benefits: [
      "Criação ilimitada de projetos",
      "Linha do tempo interativa",
      "Marcadores e categorias"
    ]
  },
  {
    icon: FiUsers,
    title: "Colaboração em Equipe",
    description: "Trabalhe em conjunto com sua equipe de forma eficiente e transparente.",
    benefits: [
      "Atribuição de tarefas",
      "Comentários em tempo real",
      "Controle de permissões"
    ]
  },
  {
    icon: FiBarChart2,
    title: "Relatórios Avançados",
    description: "Acompanhe métricas e desempenho com análises detalhadas.",
    benefits: [
      "Relatórios personalizáveis",
      "Exportação em múltiplos formatos",
      "Indicadores-chave de performance"
    ]
  },
  {
    icon: FiLock,
    title: "Segurança Robustas",
    description: "Seus dados protegidos com os mais altos padrões de segurança.",
    benefits: [
      "Autenticação de dois fatores",
      "Criptografia de ponta a ponta",
      "Backups automáticos"
    ]
  },
  {
    icon: FiCode,
    title: "Integrações",
    description: "Conecte-se com as ferramentas que sua equipe já usa.",
    benefits: [
      "API RESTful completa",
      "Webhooks para automações",
      "Integração com Slack, Google Workspace e mais"
    ]
  },
  {
    icon: FiBell,
    title: "Notificações Inteligentes",
    description: "Mantenha-se informado sem se sentir sobrecarregado.",
    benefits: [
      "Alertas personalizáveis",
      "Resumo diário ou semanal",
      "Priorização inteligente"
    ]
  }
];