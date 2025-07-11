"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/firebase/config";
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from "firebase/auth";
import { toast } from "sonner";
import { FiUser, FiMail, FiLock, FiSave, FiTrash2, FiEdit, FiX } from "react-icons/fi";
import Header from "@/components/dashboard/Header";

export default function AccountSettings() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    createdAt: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  // Carregar dados do usuário
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData({
              name: data.name || user.displayName || "",
              email: user.email || "",
              createdAt: user.metadata.creationTime || "",
            });
            setFormData({
              name: data.name || user.displayName || "",
              email: user.email || "",
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Erro ao carregar dados do usuário");
        } finally {
          setLoading(false);
        }
      } else {
        router.push("/auth/login");
      }
    };

    fetchUserData();
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      await updateDoc(doc(db, "users", user.uid), {
        name: formData.name.trim(),
        updatedAt: serverTimestamp(),
      });

      setUserData(prev => ({ ...prev, name: formData.name.trim() }));
      setEditMode(false);
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Erro ao atualizar perfil");
    }
  };

  const handleChangePassword = async () => {
    if (!user || !user.email) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordData.newPassword);

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
      toast.success("Senha alterada com sucesso!");
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(
        error.code === "auth/wrong-password"
          ? "Senha atual incorreta"
          : "Erro ao alterar senha. Tente novamente."
      );
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !user.email) return;

    try {
      // Reautenticar antes de excluir
      const credential = EmailAuthProvider.credential(user.email, deletePassword);
      await reauthenticateWithCredential(user, credential);

      // Deletar do Firestore
      await deleteDoc(doc(db, "users", user.uid));

      // Deletar conta de autenticação
      await deleteUser(user);

      toast.success("Conta excluída com sucesso");
      router.push("/");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error(
        error.code === "auth/wrong-password"
          ? "Senha incorreta"
          : "Erro ao excluir conta. Tente novamente."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirecionamento já tratado no useEffect
  }

  return (
    <>
    <Header />
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                  <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                      Configurações da Conta
                  </h1>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Gerencie suas informações pessoais e configurações de segurança
                  </p>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                  {/* Seção de Informações do Perfil */}
                  <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                          <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                              <FiUser className="text-blue-500" />
                              Informações do Perfil
                          </h2>
                          {editMode ? (
                              <div className="flex gap-2">
                                  <button
                                      onClick={() => setEditMode(false)}
                                      className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                  >
                                      <FiX size={16} />
                                  </button>
                                  <button
                                      onClick={handleSaveProfile}
                                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-1"
                                  >
                                      <FiSave size={16} />
                                      Salvar
                                  </button>
                              </div>
                          ) : (
                              <button
                                  onClick={() => setEditMode(true)}
                                  className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-1"
                              >
                                  <FiEdit size={16} />
                                  Editar
                              </button>
                          )}
                      </div>

                      <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-3">
                              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Nome
                              </label>
                              {editMode ? (
                                  <input
                                      type="text"
                                      name="name"
                                      id="name"
                                      value={formData.name}
                                      onChange={handleInputChange}
                                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border" />
                              ) : (
                                  <p className="mt-1 text-sm text-gray-900 dark:text-white p-2">
                                      {userData.name}
                                  </p>
                              )}
                          </div>

                          <div className="sm:col-span-3">
                              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Email
                              </label>
                              <p className="mt-1 text-sm text-gray-900 dark:text-white p-2 flex items-center gap-1">
                                  <FiMail />
                                  {userData.email}
                              </p>
                          </div>

                          <div className="sm:col-span-3">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Data de Criação
                              </label>
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 p-2">
                                  {new Date(userData.createdAt).toLocaleDateString('pt-BR')}
                              </p>
                          </div>
                      </div>
                  </div>

                  {/* Seção de Segurança */}
                  <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          <FiLock className="text-blue-500" />
                          Segurança
                      </h2>

                      {showPasswordForm ? (
                          <div className="mt-6 space-y-4">
                              <div>
                                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                      Senha Atual
                                  </label>
                                  <input
                                      type="password"
                                      name="currentPassword"
                                      id="currentPassword"
                                      value={passwordData.currentPassword}
                                      onChange={handlePasswordChange}
                                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border"
                                      required />
                              </div>

                              <div>
                                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                      Nova Senha
                                  </label>
                                  <input
                                      type="password"
                                      name="newPassword"
                                      id="newPassword"
                                      value={passwordData.newPassword}
                                      onChange={handlePasswordChange}
                                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border"
                                      required />
                              </div>

                              <div>
                                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                      Confirmar Nova Senha
                                  </label>
                                  <input
                                      type="password"
                                      name="confirmPassword"
                                      id="confirmPassword"
                                      value={passwordData.confirmPassword}
                                      onChange={handlePasswordChange}
                                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border"
                                      required />
                              </div>

                              <div className="flex gap-2 pt-2">
                                  <button
                                      onClick={() => setShowPasswordForm(false)}
                                      className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                  >
                                      Cancelar
                                  </button>
                                  <button
                                      onClick={handleChangePassword}
                                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-1"
                                  >
                                      <FiSave size={16} />
                                      Alterar Senha
                                  </button>
                              </div>
                          </div>
                      ) : (
                          <div className="mt-6">
                              <button
                                  onClick={() => setShowPasswordForm(true)}
                                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-1"
                              >
                                  <FiLock size={16} />
                                  Alterar Senha
                              </button>
                          </div>
                      )}
                  </div>

                  {/* Seção de Exclusão de Conta */}
                  <div className="px-6 py-5">
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          <FiTrash2 className="text-red-500" />
                          Excluir Conta
                      </h2>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          Ao excluir sua conta, todos os seus dados serão permanentemente removidos. Esta ação não pode ser desfeita.
                      </p>

                      {showDeleteConfirmation ? (
                          <div className="mt-4 space-y-4">
                              <p className="text-sm text-red-600 dark:text-red-400">
                                  Digite sua senha para confirmar a exclusão permanente da sua conta.
                              </p>
                              <div>
                                  <label htmlFor="deletePassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                      Senha Atual
                                  </label>
                                  <input
                                      type="password"
                                      name="deletePassword"
                                      id="deletePassword"
                                      value={deletePassword}
                                      onChange={(e) => setDeletePassword(e.target.value)}
                                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border"
                                      required />
                              </div>
                              <div className="flex gap-2">
                                  <button
                                      onClick={() => setShowDeleteConfirmation(false)}
                                      className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                  >
                                      Cancelar
                                  </button>
                                  <button
                                      onClick={handleDeleteAccount}
                                      className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex items-center gap-1"
                                      disabled={!deletePassword}
                                  >
                                      <FiTrash2 size={16} />
                                      Confirmar Exclusão
                                  </button>
                              </div>
                          </div>
                      ) : (
                          <button
                              onClick={() => setShowDeleteConfirmation(true)}
                              className="mt-4 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex items-center gap-1"
                          >
                              <FiTrash2 size={16} />
                              Excluir Minha Conta
                          </button>
                      )}
                  </div>
              </div>
          </div>
      </div>
      </>
  );
}