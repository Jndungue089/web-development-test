"use client";
import { useState, useEffect, useRef } from "react";
import { Bell, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/config";
import { motion, AnimatePresence, easeInOut } from "framer-motion"; // Imported easeInOut
import { collection, onSnapshot, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config"; // Ensure this is set up to export Firestore instance

export default function Header({ onUserMenu }: { onUserMenu?: () => void }) {
  const [dropdown, setDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user] = useAuthState(auth);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        where("userId", "==", user.uid),
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

  return (
    <header className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg mb-6 relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1440 320\'%3E%3Cpath fill=\'%23000022\' fill-opacity=\'0.1\' d=\'M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,85.3C672,75,768,85,864,106.7C960,128,1056,160,1152,176C1248,192,1344,192,1392,192L1440,192V320H1392C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320H0V64Z\'/%3E%3C/svg%3E')] opacity-50 pointer-events-none" />
      
      <div className="relative z-10 flex items-center justify-between">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: easeInOut }}
          className="text-2xl font-bold tracking-tight"
        >
          Project Manager
        </motion.div>
        <div className="flex items-center gap-6">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="relative cursor-pointer transition-transform duration-200"
            title="Notificações"
            onClick={() => {
              if (unreadCount > 0) {
                const q = query(
                  collection(db, "notifications"),
                  where("userId", "==", user?.uid),
                  where("read", "==", false)
                );
                onSnapshot(q, (snapshot) => {
                  snapshot.docs.forEach((doc) => updateDoc(doc.ref, { read: true }));
                });
                setUnreadCount(0);
              }
            }}
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
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 focus:outline-none transition-transform duration-200"
              onClick={() => setDropdown((d) => !d)}
            >
              <User className="w-7 h-7 text-white" />
              <span className="font-medium text-white hidden sm:block">{user?.displayName || user?.email?.split("@")[0] || "Usuário"}</span>
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
                  <div className="font-semibold text-lg mb-1">{user?.displayName || user?.email?.split("@")[0] || "Usuário"}</div>
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