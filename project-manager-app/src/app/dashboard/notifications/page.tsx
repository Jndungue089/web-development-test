"use client";
import { useState, useEffect } from "react";
import { Bell, Mail, MailOpen, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/config";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { motion, AnimatePresence } from "framer-motion";

type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  projectId?: string;
};

export default function NotificationsPage() {
  const [user] = useAuthState(auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const router = useRouter();

  // Carregar notificações em tempo real
  useEffect(() => {
    if (!user?.email) return;

    const q = query(
      collection(db, "notifications"),
      where("recipientEmail", "==", user.email)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        read: doc.data().read || false
      }) as Notification);

      setNotifications(notifs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.email]);

  // Marcar notificação como lida
  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "notifications", id), { read: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    try {
      const batch = notifications
        .filter(n => !n.read)
        .map(n => updateDoc(doc(db, "notifications", n.id), { read: true }));
      
      await Promise.all(batch);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Excluir notificação
  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, "notifications", id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Filtrar notificações
  const filteredNotifications = filter === "unread"
    ? notifications.filter(n => !n.read)
    : notifications;

  // Alternar expansão
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    if (expandedId !== id) {
      const notification = notifications.find(n => n.id === id);
      if (notification && !notification.read) {
        markAsRead(notification.id);
      }
    }
  };

  // Navegar para o projeto
  const navigateToProject = (projectId?: string) => {
    if (projectId) {
      router.push(`/dashboard/projects/${projectId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      <main className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              <Bell className="inline mr-2" size={24} />
              Notificações
            </h1>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={() => setFilter(filter === "all" ? "unread" : "all")}
                className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 ${
                  filter === "unread"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {filter === "unread" ? "Mostrar todas" : "Mostrar não lidas"}
              </button>
              
              {notifications.some(n => !n.read) && (
                <button
                  onClick={markAllAsRead}
                  className="px-3 py-1.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-sm flex items-center gap-1"
                >
                  <MailOpen size={16} />
                  <span className="hidden sm:inline">Marcar todas como lidas</span>
                  <span className="sm:hidden">Todas lidas</span>
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <MailOpen size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {filter === "unread" ? "Nenhuma notificação não lida" : "Nenhuma notificação encontrada"}
              </h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                {filter === "unread" 
                  ? "Você não tem notificações não lidas no momento." 
                  : "Quando você receber notificações, elas aparecerão aqui."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow border ${
                    notification.read
                      ? "border-gray-200 dark:border-gray-700"
                      : "border-blue-200 dark:border-blue-800"
                  }`}
                >
                  <div 
                    className={`p-4 cursor-pointer ${notification.read ? '' : 'font-semibold'}`}
                    onClick={() => toggleExpand(notification.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full mt-1 ${
                          notification.read
                            ? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                            : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}>
                          {notification.read ? <MailOpen size={18} /> : <Mail size={18} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-gray-900 dark:text-white line-clamp-1">
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        {expandedId === notification.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedId === notification.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4">
                          <p className="text-gray-700 dark:text-gray-300 mb-4">
                            {notification.message}
                          </p>
                          <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                              {!notification.read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 flex items-center gap-1"
                                >
                                  <MailOpen size={16} />
                                  <span>Marcar como lida</span>
                                </button>
                              )}
                              {notification.projectId && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigateToProject(notification.projectId);
                                  }}
                                  className="px-3 py-1.5 text-sm rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/30 text-blue-800 dark:text-blue-400 flex items-center gap-1"
                                >
                                  <span>Ver projeto</span>
                                </button>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400"
                              aria-label="Excluir notificação"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}