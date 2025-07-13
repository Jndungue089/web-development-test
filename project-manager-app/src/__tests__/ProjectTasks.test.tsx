import ProjectTasks from "@/components/dashboard/project/details/ProjectTasks";
// Mock react-dnd hooks
jest.mock("react-dnd", () => ({
  useDrag: () => [{}, () => {}, {}],
  useDrop: () => [{ isOver: false }, (ref) => ref, {}],
}));
import { render, screen } from "@testing-library/react";

describe("ProjectTasks", () => {
  const tasks = [
    { id: "1", title: "Tarefa 1", description: "Desc 1", status: "pending" as const, createdAt: new Date(), assignedTo: ["user1"] },
    { id: "2", title: "Tarefa 2", description: "Desc 2", status: "completed" as const, createdAt: new Date(), assignedTo: ["user2"] },
  ];

  it("renderiza todas as tarefas", () => {
    render(<ProjectTasks tasks={tasks} setShowTaskModal={() => {}} onTaskClick={() => {}} onStatusChange={() => {}} />);
    expect(screen.getByText("Tarefa 1")).toBeInTheDocument();
    expect(screen.getByText("Tarefa 2")).toBeInTheDocument();
  });

  it("exibe mensagem se não houver tarefas", () => {
    render(<ProjectTasks tasks={[]} setShowTaskModal={() => {}} onTaskClick={() => {}} onStatusChange={() => {}} />);
    // O componente ProjectTasks não exibe mensagem "Nenhuma tarefa" diretamente, mas TaskColumn pode exibir para cada coluna
    expect(screen.getAllByText(/Nenhum projeto nesta coluna|Nenhuma tarefa/i).length).toBeGreaterThan(0);
  });
});
