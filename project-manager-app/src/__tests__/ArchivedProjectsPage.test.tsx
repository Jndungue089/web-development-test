import { render, screen, fireEvent } from "@testing-library/react";
import ArchivedProjectsList, { ArchivedProject } from "@/components/ArchivedProjectsList";

const mockProjects: ArchivedProject[] = [
  {
    id: "1",
    title: "Projeto Teste",
    description: "Descrição Teste",
    status: "TO_DO",
    priority: "high",
    createdAt: new Date(),
    startDate: new Date(),
    endDate: new Date(),
    owner: "user1",
    members: ["user@email.com"],
    archived: true,
  },
  {
    id: "2",
    title: "Projeto 2",
    description: "Desc 2",
    status: "DONE",
    priority: "medium",
    createdAt: new Date(),
    startDate: new Date(),
    endDate: new Date(),
    owner: "user1",
    members: ["user@email.com"],
    archived: true,
  },
];

describe("ArchivedProjectsList", () => {
  it("renderiza projetos arquivados e botões de desarquivar", async () => {
    render(
      <ArchivedProjectsList
        projects={mockProjects}
        onUnarchive={jest.fn()}
        onUnarchiveAll={jest.fn()}
      />
    );
    expect(screen.getByText("Projetos Arquivados")).toBeInTheDocument();
    expect(screen.getByText("Projeto Teste")).toBeInTheDocument();
    expect(screen.getByText("Projeto 2")).toBeInTheDocument();
    expect(screen.getByText("Desarquivar Todos")).toBeInTheDocument();
    expect(screen.getAllByText("Desarquivar").length).toBe(2);
  });

  it("confirma desarquivação individual", async () => {
    window.confirm = jest.fn(() => true);
    const onUnarchive = jest.fn();
    render(
      <ArchivedProjectsList
        projects={mockProjects}
        onUnarchive={onUnarchive}
        onUnarchiveAll={jest.fn()}
      />
    );
    fireEvent.click(screen.getAllByText("Desarquivar")[0]);
    expect(window.confirm).toHaveBeenCalledWith('Deseja desarquivar o projeto "Projeto Teste"?');
    expect(onUnarchive).toHaveBeenCalledWith("1");
  });

  it("confirma desarquivação de todos", async () => {
    window.confirm = jest.fn(() => true);
    const onUnarchiveAll = jest.fn();
    render(
      <ArchivedProjectsList
        projects={mockProjects}
        onUnarchive={jest.fn()}
        onUnarchiveAll={onUnarchiveAll}
      />
    );
    fireEvent.click(screen.getByText("Desarquivar Todos"));
    expect(window.confirm).toHaveBeenCalledWith("Deseja desarquivar TODOS os projetos arquivados?");
    expect(onUnarchiveAll).toHaveBeenCalled();
  });

  it("não desarquiva se cancelar confirmação", async () => {
    window.confirm = jest.fn(() => false);
    const onUnarchiveAll = jest.fn();
    render(
      <ArchivedProjectsList
        projects={mockProjects}
        onUnarchive={jest.fn()}
        onUnarchiveAll={onUnarchiveAll}
      />
    );
    fireEvent.click(screen.getByText("Desarquivar Todos"));
    expect(window.confirm).toHaveBeenCalled();
    expect(onUnarchiveAll).not.toHaveBeenCalled();
  });
});
