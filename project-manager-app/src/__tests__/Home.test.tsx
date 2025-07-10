import { render, screen } from "@testing-library/react";
import Home from "../app/page";

describe("Home", () => {
  it("exibe título e botões principais", () => {
    render(<Home />);
    expect(screen.getByText(/Bem-vindo ao Project Manager App/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Entrar/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Dashboard/i })).toBeInTheDocument();
  });
});
