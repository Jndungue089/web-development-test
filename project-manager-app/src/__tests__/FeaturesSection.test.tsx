import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { render, screen } from "@testing-library/react";


describe("FeaturesSection", () => {
  it("renderiza título e subtítulo principais", () => {
    render(<FeaturesSection />);
    expect(screen.getByText(/Recursos Poderosos/i)).toBeInTheDocument();
    expect(screen.getByText(/Tudo o que sua equipe precisa/i)).toBeInTheDocument();
  });

  it("renderiza todos os títulos de features", () => {
    const featuresTitles = [
      "Gestão de Projetos",
      "Colaboração em Equipe",
      "Relatórios Avançados",
      "Segurança Robustas",
      "Integrações",
      "Notificações Inteligentes"
    ];

    render(<FeaturesSection />);

    featuresTitles.forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });

  it("renderiza título do destaque de dashboard", () => {
    render(<FeaturesSection />);
    expect(screen.getByText("Dashboard Intuitivo")).toBeInTheDocument();
    expect(screen.getByText(/Visualize o progresso/i)).toBeInTheDocument();
    expect(screen.getByText("Tempo Real")).toBeInTheDocument();
    expect(screen.getByText("Personalizável")).toBeInTheDocument();
    expect(screen.getByText("Responsivo")).toBeInTheDocument();
  });

  it("renderiza alguns benefícios", () => {
    render(<FeaturesSection />);
    expect(screen.getByText(/Linha do tempo interativa/i)).toBeInTheDocument();
    expect(screen.getByText(/Comentários em tempo real/i)).toBeInTheDocument();
    expect(screen.getByText(/Criptografia de ponta a ponta/i)).toBeInTheDocument();
    expect(screen.getByText(/Webhooks para automações/i)).toBeInTheDocument();
  });
});
