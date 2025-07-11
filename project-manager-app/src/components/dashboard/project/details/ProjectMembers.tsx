import { FiUser } from "react-icons/fi";

interface ProjectMembersProps {
  members: string[];
}

export default function ProjectMembers({ members }: ProjectMembersProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold dark:text-white">Membros da Equipe</h2>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {members.map((memberId) => (
            <div key={memberId} className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                <FiUser className="text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="font-medium dark:text-white">{memberId}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Membro</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}