import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { HeroSection } from "@/components/landing/Hero";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("framer-motion", () => {
  const React = require("react");
  return {
    motion: {
      div: React.forwardRef((props: any, ref) => <div {...props} ref={ref} />),
      h1: React.forwardRef((props: any, ref) => <h1 {...props} ref={ref} />),
      p: React.forwardRef((props: any, ref) => <p {...props} ref={ref} />),
      span: React.forwardRef((props: any, ref) => <span {...props} ref={ref} />),
    },
  };
});

describe("HeroSection", () => {
  beforeEach(() => render(<HeroSection />));

  it("renderiza botões de ação", () => {
    expect(screen.getByTestId("cta-signup")).toBeInTheDocument();
  });

  it("renderiza destaques", () => {
    expect(screen.getByText(/Sem cartão necessário/i)).toBeInTheDocument();
    expect(screen.getByText(/Configuração em 2 minutos/i)).toBeInTheDocument();
    expect(screen.getByText(/Suporte 24\/7/i)).toBeInTheDocument();
  });

  it("renderiza mockup de dashboard", () => {
    expect(screen.getByTestId("mockup-title")).toHaveTextContent("Dashboard PMS");
    expect(screen.getByTestId("mockup-subtitle")).toHaveTextContent("Visualização do painel de controle");
  });

});
