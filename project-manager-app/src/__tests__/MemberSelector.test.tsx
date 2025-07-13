import MemberSelector from "@/app/dashboard/projects/[id]/MemberSelector";
import { render, screen, fireEvent } from "@testing-library/react";

describe("MemberSelector", () => {
  const allUsers = ["user1", "user2", "user3"];
  const projectMembers = ["user1", "user2"];
  const selectedUsers = ["user1"];
  const onSelect = jest.fn();

  it("renderiza membros selecionados", () => {
    render(
      <MemberSelector
        allUsers={allUsers}
        projectMembers={projectMembers}
        selectedUsers={selectedUsers}
        onSelect={onSelect}
      />
    );
    expect(screen.getByText("user1")).toBeInTheDocument();
  });

  it("abre busca de membros ao clicar", () => {
    render(
      <MemberSelector
        allUsers={allUsers}
        projectMembers={projectMembers}
        selectedUsers={selectedUsers}
        onSelect={onSelect}
      />
    );
    // Clica no container de membros (usando o texto do membro já renderizado)
    fireEvent.click(screen.getByText("user1"));
    expect(screen.getByPlaceholderText(/Buscar membros/i)).toBeInTheDocument();
  });
});
