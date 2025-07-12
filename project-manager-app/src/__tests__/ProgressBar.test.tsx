import { render, screen } from "@testing-library/react";
import ProgressBar from "../components/ProgressBar"; // ajuste o caminho se necessário

describe("ProgressBar", () => {
    it("renderiza corretamente com valor padrão", () => {
        render(<ProgressBar value={50} />);
        const bar = screen.getByRole("progressbar");
        expect(bar).toBeInTheDocument();
    });

    it("limita o valor mínimo em 0", () => {
        render(<ProgressBar value={-20} showLabel />);
        expect(screen.getByText("0%")).toBeInTheDocument();
    });

    it("limita o valor máximo em 100", () => {
        render(<ProgressBar value={150} showLabel />);
        expect(screen.getByText("100%")).toBeInTheDocument();
    });

    it("exibe o rótulo se showLabel for true", () => {
        render(<ProgressBar value={70} showLabel />);
        expect(screen.getByText("70%")).toBeInTheDocument();
    });

    it("não exibe o rótulo se showLabel for false", () => {
        render(<ProgressBar value={70} />);
        expect(screen.queryByText("70%")).not.toBeInTheDocument();
    });

    it("aplica altura personalizada", () => {
        const { getByRole } = render(<ProgressBar value={30} height={12} />);
        const progressElement = getByRole("progressbar");

        // O contêiner que recebe o estilo de altura é o pai direto
        const containerWithHeight = progressElement.parentElement;

        expect(containerWithHeight).toHaveStyle("height: 12px");
    });


    it("aplica classe de cor personalizada", () => {
        const { container } = render(<ProgressBar value={60} color="bg-red-500" />);
        const innerBar = container.querySelector(".bg-red-500");
        expect(innerBar).toBeInTheDocument();
    });
});
