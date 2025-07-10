"use client";
import { useState, useEffect } from "react";
import { FiUser, FiX, FiSearch, FiCheck } from "react-icons/fi";

type MemberSelectorProps = {
  allUsers: string[];
  projectMembers: string[];
  selectedUsers: string[];
  onSelect: (users: string[]) => void;
};

export default function MemberSelector({ 
  allUsers, 
  projectMembers, 
  selectedUsers, 
  onSelect 
}: MemberSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<string[]>([]);

  useEffect(() => {
    // Filtrar usuários disponíveis (que estão no projeto e não foram selecionados)
    const filtered = projectMembers.filter(
      user => !selectedUsers.includes(user) && 
              user.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setAvailableUsers(filtered);
  }, [searchTerm, selectedUsers, projectMembers]);

  const toggleUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      onSelect(selectedUsers.filter(id => id !== userId));
    } else {
      onSelect([...selectedUsers, userId]);
    }
  };

  return (
    <div className="relative">
      <div 
        className="flex flex-wrap gap-2 p-2 border border-gray-300 dark:border-gray-700 rounded-lg min-h-12 cursor-text"
        onClick={() => setIsOpen(true)}
      >
        {selectedUsers.length === 0 ? (
          <span className="text-gray-500 text-sm">Selecione os responsáveis...</span>
        ) : (
          selectedUsers.map(user => (
            <div 
              key={user} 
              className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm"
            >
              <FiUser className="mr-1" size={12} />
              {user}
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleUser(user);
                }}
                className="ml-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <FiX size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex items-center">
            <FiSearch className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Buscar membros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {availableUsers.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">Nenhum membro disponível</div>
            ) : (
              availableUsers.map(user => (
                <div
                  key={user}
                  className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => toggleUser(user)}
                >
                  <div className={`w-4 h-4 rounded border mr-3 ${selectedUsers.includes(user) ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-600'}`}>
                    {selectedUsers.includes(user) && (
                      <FiCheck className="text-white" size={12} />
                    )}
                  </div>
                  <FiUser className="mr-2 text-gray-500" size={14} />
                  <span className="text-sm">{user}</span>
                </div>
              ))
            )}
          </div>
          <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-right">
            <button
              type="button"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              onClick={() => setIsOpen(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}