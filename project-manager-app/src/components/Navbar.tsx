"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiHome, FiInfo, FiGrid, FiMail, FiUser, FiLogIn, FiLogOut, FiMoon, FiSun } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import app from "@/firebase/config";

const auth = getAuth(app);
const db = getFirestore(app);

export function Navbar() {
  const [activeTab, setActiveTab] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  // Verifica autenticação e tema
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData({
            name: userDoc.data().name || user.displayName || "Usuário",
            email: user.email || "",
          });
        }
      } else {
        setIsLoggedIn(false);
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
    setActiveTab(path);
    router.push(path);
  };

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  // Itens da Navbar
  const navItems = [
    { id: "home", icon: <FiHome size={18} />, label: "Home", path: "/" },
    { id: "about", icon: <FiInfo size={18} />, label: "Sobre", path: "/#about" },
    { id: "features", icon: <FiGrid size={18} />, label: "Features", path: "/#features" },
    { id: "contact", icon: <FiMail size={18} />, label: "Contacto", path: "/#contact" },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div
            onClick={() => navigate("/")}
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

          {/* Links Centrais */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(item.path)}
                className={`flex items-center px-3 py-2 rounded-lg transition-all ${activeTab === item.id
                  ? "text-blue-600 dark:text-blue-400 font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-300"
                  }`}
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Lado Direito (Login/Perfil + Theme Toggle) */}
          <div className="flex items-center space-x-4">
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

            {/* Se logado, mostra perfil; senão, mostra login */}
            {isLoggedIn ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <FiUser size={16} />
                  <span>{userData?.name.split(" ")[0] || "Perfil"}</span>
                </motion.button>

                {/* Menu suspenso do perfil */}
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {userData?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {userData?.email}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate("/dashboard")}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Sair
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/auth/login")}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
              >
                <FiLogIn size={16} className="mr-2" />
                Entrar
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}