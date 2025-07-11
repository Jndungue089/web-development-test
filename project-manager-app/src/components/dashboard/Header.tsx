"use client";
import { useState, useEffect, useRef } from "react";
import { Bell, ChevronDown, Mail, MailOpen, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/config";
import { motion, AnimatePresence, easeInOut } from "framer-motion"; // Imported easeInOut
import { collection, onSnapshot, query, where, doc, updateDoc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/config"; // Ensure this is set up to export Firestore instance
import { onAuthStateChanged } from "@firebase/auth";
import { FiGrid, FiMoon, FiSun } from "react-icons/fi";


type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
};

export default function Header({ onUserMenu }: { onUserMenu?: () => void }) {
  const [dropdown, setDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null);
  const [user] = useAuthState(auth);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData({
            name: userDoc.data().name || user.displayName || "Usuário",
            email: user.email || "",
          });
        }
      } else {
        setUserData(null);
      }
    });

    // Verifica tema salvo
    const savedTheme = localStorage.getItem("theme");
    setDarkMode(savedTheme === "dark");

    return () => unsubscribe();
  }, []);

  // Alternar tema
  const toggleTheme = () => {
    const newTheme = !darkMode ? "dark" : "light";
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", !darkMode);
    setDarkMode(!darkMode);
  };

  // Navegação
  const navigate = (path: string) => {
    router.push(path);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch unread notifications count in real-time
  useEffect(() => {
    if (user?.uid) {
      const q = query(
        collection(db, "notifications"),
        where("recipientEmail", "==", user.email),
        where("read", "==", false)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setUnreadCount(snapshot.docs.length);
      });
      return () => unsubscribe();
    }
  }, [user?.uid]);

  const handleLogout = () => {
    setDropdown(false);
    if (onUserMenu) {
      onUserMenu();
    }
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: easeInOut } }, // Fixed ease
    exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15, ease: easeInOut } }, // Fixed ease
  };

  // Carregar notificações em tempo real
  useEffect(() => {
    if (user?.uid) {
      console.log(user)

      const q = query(
        collection(db, "notifications"),
        where("recipientEmail", "==", user.email),
        where("read", "==", false)
      );
      console.log(q)
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }) as Notification);
        setNotifications(notifs);
      });
      return () => unsubscribe();
    }
  }, [user?.uid]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowAllNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Marcar notificação como lida/não lida
  const toggleReadStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "notifications", id), {
        read: !currentStatus
      });
    } catch (error) {
      console.error("Error updating notification:", error);
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

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    try {
      const batch = notifications.map(notif =>
        updateDoc(doc(db, "notifications", notif.id), { read: true })
      );
      await Promise.all(batch);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const displayedNotifications = showAllNotifications
    ? [...notifications].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    : [...notifications]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);

  return (
    <header className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg mb-6 relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1440 320\'%3E%3Cpath fill=\'%23000022\' fill-opacity=\'0.1\' d=\'M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,85.3C672,75,768,85,864,106.7C960,128,1056,160,1152,176C1248,192,1344,192,1392,192L1440,192V320H1392C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320H0V64Z\'/%3E%3C/svg%3E')] opacity-50 pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => navigate("/dashboard")}
          className="flex items-center cursor-pointer"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 rounded-md bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center">
              <FiGrid className="text-white" size={16} />
            </div>
            <span className="text-xl font-bold text-gray-800 dark:text-white">
              PMS
            </span>
          </motion.div>
        </div>
        <div className="flex items-center gap-6">
          {/* Botão de Tema */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            aria-label="Alternar tema"
          >
            {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
          </motion.button>
          {/* Dropdown de Notificações */}
          <div className="relative" ref={notificationsRef}>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative cursor-pointer transition-transform duration-200"
              onClick={() => setShowAllNotifications(!showAllNotifications)}
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-2 bg-red-400 text-white text-xs rounded-full px-1.5 py-0.5 shadow-md"
                >
                  {unreadCount}
                </motion.span>
              )}
            </motion.div>

            <AnimatePresence>
              {showAllNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 overflow-hidden border border-gray-200 dark:border-gray-700"
                >
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800 dark:text-white">Notificações</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        disabled={unreadCount === 0}
                      >
                        Marcar todas como lidas
                      </button>
                      <button
                        onClick={() => setShowAllNotifications(false)}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {displayedNotifications.length > 0 ? (
                      displayedNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 border-b border-gray-100 dark:border-gray-700 ${notification.read ? 'bg-gray-50 dark:bg-gray-700/50' : 'bg-white dark:bg-gray-800'}`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800 dark:text-white">{notification.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                {notification.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-2">
                              <button
                                onClick={() => toggleReadStatus(notification.id, notification.read)}
                                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                title={notification.read ? "Marcar como não lida" : "Marcar como lida"}
                              >
                                {notification.read ? (
                                  <MailOpen size={16} className="text-gray-500" />
                                ) : (
                                  <Mail size={16} className="text-blue-500" />
                                )}
                              </button>
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                title="Excluir notificação"
                              >
                                <X size={16} className="text-gray-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        Nenhuma notificação
                      </div>
                    )}
                  </div>

                  {notifications.length > 5 && (
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                      <button
                        onClick={() => router.push("/notifications")}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1 w-full"
                      >
                        Ver todas as notificações
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 focus:outline-none transition-transform duration-200"
              onClick={() => setDropdown((d) => !d)}
            >
              <User className="w-7 h-7 text-white" />
              <span className="font-medium text-white hidden sm:block">{userData?.name || "Usuário"}</span>
            </motion.button>
            <AnimatePresence>
              {dropdown && (
                <motion.div
                  ref={dropdownRef}
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50 p-4 flex flex-col items-center text-gray-800"
                  style={{ position: "absolute", top: "100%" }}
                >
                  <motion.div
                    className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2"
                    initial={{ rotate: 0 }}
                  >
                    <User className="w-8 h-8 text-gray-500" />
                  </motion.div>
                  <div className="font-semibold text-lg mb-1">{userData?.name || "Usuário"}</div>
                  <div className="text-gray-500 text-sm mb-3">{user?.email || "Nenhum email"}</div>
                  <button
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2 transition-colors duration-200"
                    onClick={() => { setDropdown(false); router.push("/settings"); }}
                  >
                    <span className="text-gray-700">Configurações</span>
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2 text-red-600 transition-colors duration-200"
                    onClick={handleLogout}
                  >
                    Sair
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}