import { motion } from "framer-motion";
import { Pie, Bar } from "react-chartjs-2";
import { FiArchive, FiCheck, FiPlay, FiClock } from "react-icons/fi";

export default function DashboardStats({ stats, monthlyData }: {
  stats: {
    totalProjects: number;
    completed: number;
    inProgress: number;
    overdue: number;
    completionRate: number;
    highPriority: number;
  };
  monthlyData: Array<{ month: string; completed: number }>;
}) {
  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
      <h2 className="text-xl font-semibold mb-4 dark:text-white">Visão Geral</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<FiArchive className="text-blue-500" size={20} />}
          title="Total de Projetos"
          value={stats.totalProjects}
          trend="+12%"
          color="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard
          icon={<FiCheck className="text-green-500" size={20} />}
          title="Concluídos"
          value={stats.completed}
          color="bg-green-50 dark:bg-green-900/20"
        />
        <StatCard
          icon={<FiPlay className="text-yellow-500" size={20} />}
          title="Em Progresso"
          value={stats.inProgress}
          color="bg-yellow-50 dark:bg-green-900/20"
        />
        <StatCard
          icon={<FiClock className="text-red-500" size={20} />}
          title="Atrasados"
          value={stats.overdue}
          color="bg-red-50 dark:bg-red-900/20"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-medium mb-3 dark:text-white">Distribuição por Status</h3>
          <div className="h-64">
            <Pie
              data={{
                labels: ["Por Fazer", "Em Progresso", "Concluído"],
                datasets: [
                  {
                    data: [stats.totalProjects - stats.inProgress - stats.completed, stats.inProgress, stats.completed],
                    backgroundColor: ["#3B82F6", "#FBBF24", "#10B981"],
                    borderColor: ["#2563EB", "#D97706", "#059669"],
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { position: "top" } },
              }}
            />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-medium mb-3 dark:text-white">Progresso Mensal</h3>
          <div className="h-64">
            <Bar
              data={{
                labels: monthlyData.map((d) => d.month),
                datasets: [
                  {
                    label: "Projetos Concluídos",
                    data: monthlyData.map((d) => d.completed),
                    backgroundColor: "#10B981",
                    borderColor: "#059669",
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: { display: true, text: "Projetos Concluídos" },
                  },
                  x: {
                    title: { display: true, text: "Mês" },
                  },
                },
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

const StatCard = ({ icon, title, value, trend, color }: { icon: React.ReactNode; title: string; value: string | number; trend?: string; color: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 ${color}`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <h3 className="text-2xl font-bold mt-1 dark:text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg bg-opacity-20 ${color}`}>{icon}</div>
    </div>
    {trend && (
      <div className="mt-2 flex items-center text-sm">
        <span className={`${trend.startsWith('+') ? 'text-green-500' : 'text-red-500'} flex items-center`}>
          {trend.startsWith('+') ? '↑' : '↓'} {trend}
        </span>
        <span className="text-gray-500 dark:text-gray-400 ml-1">vs último mês</span>
      </div>
    )}
  </motion.div>
);
