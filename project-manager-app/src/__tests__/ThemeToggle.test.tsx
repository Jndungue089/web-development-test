import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggle } from "../components/ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    // Resetar DOM entre testes
    document.documentElement.className = "";
    localStorage.clear();
  });

  it("renderiza após montagem", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: "Alternar tema" });
    expect(button).toBeInTheDocument();
  });

  it("inicia com tema claro por padrão", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: "Alternar tema" });
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("alterna para tema escuro ao clicar", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: "Alternar tema" });

    fireEvent.click(button);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("usa tema salvo no localStorage (dark)", () => {
    localStorage.setItem("theme", "dark");
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: "Alternar tema" });
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("usa tema salvo no localStorage (light)", () => {
    localStorage.setItem("theme", "light");
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: "Alternar tema" });
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
