import { ContactSection } from "@/components/landing/ContactSection";
import { render, screen } from "@testing-library/react";

jest.mock("react-firebase-hooks/auth", () => ({
  useAuthState: () => [{ uid: "mock-user-id" }],
}));

jest.mock("@/firebase/config", () => ({
  auth: {},
  db: {},
}));

describe("ContactSection", () => {
  it("renderiza o cabeçalho da seção", () => {
    render(<ContactSection />);
    expect(screen.getByText("Fale Connosco")).toBeInTheDocument();
    expect(
      screen.getByText(/Tem dúvidas ou sugestões/i)
    ).toBeInTheDocument();
  });

  it("renderiza as informações de contacto", () => {
    render(<ContactSection />);
    expect(screen.getByText("Informações de Contacto")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Telefone")).toBeInTheDocument();
    expect(screen.getByText("Escritório")).toBeInTheDocument();
    expect(screen.getByText(/suporte@pms.com/i)).toBeInTheDocument();
    expect(screen.getByText(/comercial@pms.com/i)).toBeInTheDocument();
  });

  it("renderiza o horário de funcionamento", () => {
    render(<ContactSection />);
    expect(screen.getByText("Horário de Funcionamento")).toBeInTheDocument();
    expect(screen.getByText("Segunda - Sexta")).toBeInTheDocument();
    expect(screen.getByText("Sábado")).toBeInTheDocument();
    expect(screen.getByText("Domingo")).toBeInTheDocument();
  });

  it("renderiza o formulário de mensagem", () => {
    render(<ContactSection />);
    expect(screen.getByRole("textbox", { name: /Nome Completo/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /Email/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /Assunto/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /Mensagem/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Enviar Mensagem/i })).toBeInTheDocument();
  });
});
