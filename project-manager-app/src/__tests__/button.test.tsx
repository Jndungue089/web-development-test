import { Button } from "@/components/ui/button";
import { render, screen } from "@testing-library/react";

describe("Button", () => {
  it("renderiza com texto", () => {
    render(<Button>Enviar</Button>);
    expect(screen.getByText("Enviar")).toBeInTheDocument();
  });

  it("aplica variante secundária", () => {
    render(<Button variant="secondary">Secundário</Button>);
    expect(screen.getByText("Secundário")).toBeInTheDocument();
  });

  it("fica desabilitado quando prop disabled é true", () => {
    render(<Button disabled>Desabilitado</Button>);
    expect(screen.getByText("Desabilitado")).toBeDisabled();
  });
});
