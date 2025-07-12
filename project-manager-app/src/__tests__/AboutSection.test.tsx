import { AboutSection } from "@/components/landing/AboutSection";
import { render, screen } from "@testing-library/react";

describe("AboutSection", () => {
  beforeEach(() => {
    render(<AboutSection />);
  });

  it("renderiza título e descrição principal", () => {
    expect(screen.getByText(/Sobre o PMS/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Uma solução completa para gerenciamento de projetos/i)
    ).toBeInTheDocument();
  });

  it("renderiza subtítulo e parágrafos descritivos", () => {
    expect(
      screen.getByText((t) =>
        t.includes("Transformando a gestão de projetos")
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText((t) =>
        t.includes("O PMS (Project Management System)")
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText((t) =>
        t.includes("Desenvolvido com React.js e Next.js")
      )
    ).toBeInTheDocument();
  });

  it("renderiza os itens com ícones de check", () => {
    expect(
      screen.getByText((t) =>
        t.includes("Interface intuitiva e fácil de usar")
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText((t) =>
        t.includes("Colaboração em tempo real entre equipes")
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText((t) =>
        t.includes("Acompanhamento detalhado de progresso")
      )
    ).toBeInTheDocument();
  });

  it("renderiza todos os destaques de funcionalidades", () => {
    const featureTitles = [
      "Gestão de Equipes",
      "Controle de Prazos",
      "Sistema de Notificações",
      "Autenticação Segura",
      "Persistência de Dados",
      "Tecnologia Moderna",
    ];

    featureTitles.forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Atribua membros a projetos/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Sistema de login protegido com Firebase/i)
    ).toBeInTheDocument();
  });
});
