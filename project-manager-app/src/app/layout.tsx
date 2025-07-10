import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PMS - Organização e Colaboração Eficiente",
  description: "Crie, organize e monitore projetos com nossa aplicação de gerenciamento de projetos. Inclui tarefas, colaboração em equipe e notificações de prazos.",
  keywords: "gerenciamento de projetos, organização de tarefas, colaboração em equipe, aplicativo de projetos, Next.js",
  authors: [{ name: "Josemar Ndungue", url: "https://github.com/jndungue089" }],
  openGraph: {
    title: "PMS",
    description: "Ferramenta intuitiva para gerenciar projetos e tarefas com sua equipe.",
    url: "https://pms.com",
    siteName: "Gerenciador de Projetos",
    images: [
      {
        url: "https://pms.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Imagem de destaque do Gerenciador de Projetos",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PMS",
    description: "Gerencie projetos e tarefas com eficiência e colaboração em equipe.",
    images: ["https://pms.com/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}