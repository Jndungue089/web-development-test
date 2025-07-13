import ProjectMembers from "@/components/dashboard/project/details/ProjectMembers";
import { render, screen } from "@testing-library/react";

describe("ProjectMembers", () => {
  const members = ["user1", "user2"];

  it("renderiza o número de membros", () => {
    render(<ProjectMembers members={members} />);
    expect(screen.getByText("2 membros")).toBeInTheDocument();
  });

  it("exibe mensagem se não houver membros", () => {
    render(<ProjectMembers members={[]} />);
    expect(screen.getByText(/Nenhum membro/i)).toBeInTheDocument();
  });
});
