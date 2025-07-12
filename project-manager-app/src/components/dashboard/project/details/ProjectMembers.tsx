import { FiUser } from "react-icons/fi";

interface ProjectMembersProps {
  members: string[];
}

export default function ProjectMembers({ members }: ProjectMembersProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex justify-between items-center px-2 sm:px-0">
        <h2 className="text-lg md:text-xl font-semibold dark:text-white">Membros da Equipe</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {members.length} {members.length === 1 ? 'membro' : 'membros'}
        </span>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 md:p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        {members.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            Nenhum membro adicionado ao projeto
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {members.map((memberId) => (
              <div 
                key={memberId} 
                className="flex items-center p-2 sm:p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                  <FiUser className="text-gray-600 dark:text-gray-400 text-sm sm:text-base" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium dark:text-white text-sm sm:text-base truncate">
                    {memberId}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                    {memberId.includes('@') ? 'Membro' : 'Usuário'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}