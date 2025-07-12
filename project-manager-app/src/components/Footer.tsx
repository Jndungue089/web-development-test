"use client";
import { motion } from "framer-motion";
import { FiTwitter, FiLinkedin, FiGithub, FiMail, FiGrid } from "react-icons/fi";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Logo e Descrição */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center">
                <FiGrid className="text-white" size={16} />
              </div>
              <span className="text-xl font-bold">PMS</span>
            </div>
            <p className="text-gray-400">
              A solução completa para gestão de projetos que sua equipe precisa para ser mais produtiva.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3 }}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Links Rápidos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Recursos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4">Recursos</h3>
            <ul className="space-y-3">
              {resources.map((resource, index) => (
                <li key={index}>
                  <Link href={resource.href} className="text-gray-400 hover:text-white transition-colors">
                    {resource.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold">Newsletter</h3>
            <p className="text-gray-400">
              Subscreva para receber as últimas atualizações e novidades.
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Seu email"
                className="px-4 py-2 rounded-l-lg w-full
             bg-gray-800 text-white placeholder-gray-400
             border border-gray-500 focus:border-blue-400
             focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-lg transition-colors"
              >
                <FiMail size={20} />
              </button>
            </form>
          </motion.div>
        </div>

        {/* Divisor */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 my-8"
        ></motion.div>

        {/* Direitos Autorais */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm"
        >
          <div className="mb-4 md:mb-0">
            © {new Date().getFullYear()} PMS. Todos os direitos reservados.
          </div>
          <div className="flex space-x-6">
            <Link href="#" className="hover:text-white transition-colors">
              Política de Privacidade
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Termos de Serviço
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Cookies
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

const socialLinks = [
  {
    name: "Twitter",
    href: "https://twitter.com",
    icon: FiTwitter
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    icon: FiLinkedin
  },
  {
    name: "GitHub",
    href: "https://github.com",
    icon: FiGithub
  }
];

const quickLinks = [
  { name: "Início", href: "/" },
  { name: "Sobre", href: "/sobre" },
  { name: "Recursos", href: "/recursos" },
  { name: "Preços", href: "/precos" },
  { name: "Contacto", href: "/contacto" }
];

const resources = [
  { name: "Documentação", href: "/docs" },
  { name: "Centro de Ajuda", href: "/ajuda" },
  { name: "Blog", href: "/blog" },
  { name: "Webinars", href: "/webinars" },
  { name: "API", href: "/api" }
];