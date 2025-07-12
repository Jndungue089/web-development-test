import { render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";
import { Footer } from "@/components/Footer";

describe("Footer", () => {
    it("renderiza o componente", () => {
        render(<Footer />);
        expect(screen.getByText("PMS")).toBeInTheDocument();
        expect(screen.getByText("Newsletter")).toBeInTheDocument();
        expect(screen.getByText("Links Rápidos")).toBeInTheDocument();
        expect(screen.getByText("Recursos", { selector: "h3" })).toBeInTheDocument();
    });

    it("renderiza links sociais", () => {
        render(<Footer />);
        expect(screen.getByLabelText("Twitter")).toBeInTheDocument();
        expect(screen.getByLabelText("LinkedIn")).toBeInTheDocument();
        expect(screen.getByLabelText("GitHub")).toBeInTheDocument();
    });

    it("renderiza links rápidos", () => {
        render(<Footer />);
        expect(screen.getByText("Início")).toBeInTheDocument();
        expect(screen.getByText("Sobre")).toBeInTheDocument();
        expect(screen.getByText("Recursos", { selector: "a" })).toBeInTheDocument();
        expect(screen.getByText("Preços")).toBeInTheDocument();
        expect(screen.getByText("Contacto")).toBeInTheDocument();
    });

    it("renderiza recursos", () => {
        render(<Footer />);
        expect(screen.getByText("Documentação")).toBeInTheDocument();
        expect(screen.getByText("Centro de Ajuda")).toBeInTheDocument();
        expect(screen.getByText("Blog")).toBeInTheDocument();
        expect(screen.getByText("Webinars")).toBeInTheDocument();
        expect(screen.getByText("API")).toBeInTheDocument();
    });

    it("renderiza input de email", () => {
        render(<Footer />);
        expect(screen.getByPlaceholderText("Seu email")).toBeInTheDocument();
    });

    it("exibe o ano atual corretamente", () => {
        render(<Footer />);
        const currentYear = new Date().getFullYear();
        expect(screen.getByText(`© ${currentYear} PMS. Todos os direitos reservados.`)).toBeInTheDocument();
    });

    it("renderiza links de política", () => {
        render(<Footer />);
        expect(screen.getByText("Política de Privacidade")).toBeInTheDocument();
        expect(screen.getByText("Termos de Serviço")).toBeInTheDocument();
        expect(screen.getByText("Cookies")).toBeInTheDocument();
    });
});
