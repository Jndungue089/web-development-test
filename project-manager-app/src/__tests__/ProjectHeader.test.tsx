
import ProjectHeader from "@/components/dashboard/project/details/ProjectHeader";
import { render, screen } from "@testing-library/react";
import { Project } from "@/types/project";

describe("ProjectHeader", () => {
  const mockProject: Project = {
    id: "1",
    title: "Projeto Teste",
    description: "Descrição do projeto",
    startDate: { toDate: () => new Date("2025-07-01"), seconds: 0, nanoseconds: 0, toMillis: () => 0, isEqual: () => true, toJSON: () => "", },
    endDate: { toDate: () => new Date("2025-07-31"), seconds: 0, nanoseconds: 0, toMillis: () => 0, isEqual: () => true, toJSON: () => "", },
    owner: "user1",
    members: ["user1", "user2"],
    tasks: [],
    createdAt: { toDate: () => new Date(), seconds: 0, nanoseconds: 0, toMillis: () => 0, isEqual: () => true, toJSON: () => "", },
    // outros campos conforme necessário
  };

  it("renderiza título do projeto e permissões", () => {
    render(
      <ProjectHeader
        project={mockProject}
        canEdit={true}
        canDelete={true}
        onDelete={() => {}}
      />
    );
    expect(screen.getByText("Projeto Teste")).toBeInTheDocument();
    expect(screen.getByText("Editar Projeto")).toBeInTheDocument();
    expect(screen.getByText("Excluir")).toBeInTheDocument();
  });

  it("não renderiza botões de editar/excluir para membros sem permissão", () => {
    render(
      <ProjectHeader
        project={mockProject}
        canEdit={false}
        canDelete={false}
        onDelete={() => {}}
      />
    );
    expect(screen.queryByText("Editar Projeto")).toBeNull();
    expect(screen.queryByText("Excluir")).toBeNull();
  });
});
