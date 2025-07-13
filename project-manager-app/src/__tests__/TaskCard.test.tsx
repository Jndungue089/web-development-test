import TaskCard from "@/components/dashboard/project/details/TaskCard";
// Mock react-dnd hooks
jest.mock("react-dnd", () => ({
  useDrag: () => [{ isDragging: false }, (ref) => ref, {}],
  useDrop: () => [{}, () => {}, {}],
}));
import { render, screen, fireEvent } from "@testing-library/react";
import { Task } from "@/types/project";

describe("TaskCard", () => {
  const mockTask: Task = {
    id: "1",
    title: "Tarefa Teste",
    description: "Descrição da tarefa",
    status: "pending",
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    assignedTo: ["user1"],
    // comments: [],
    createdAt: new Date(),
    // updatedAt: new Date(),
  };

  it("renderiza título e descrição", () => {
    render(<TaskCard task={mockTask} onClick={() => {}} onStatusChange={() => {}} />);
    expect(screen.getByText("Tarefa Teste")).toBeInTheDocument();
    expect(screen.getByText("Descrição da tarefa")).toBeInTheDocument();
  });

  it("chama onClick ao clicar", () => {
    const onClick = jest.fn();
    render(<TaskCard task={mockTask} onClick={onClick} onStatusChange={() => {}} />);
    fireEvent.click(screen.getByText("Tarefa Teste"));
    expect(onClick).toHaveBeenCalled();
  });

  it("exibe alerta de atraso se overdue", () => {
    const overdueTask = { ...mockTask, dueDate: new Date(Date.now() - 86400000).toISOString() };
    render(<TaskCard task={overdueTask} onClick={() => {}} onStatusChange={() => {}} />);
    expect(screen.getByText(/Atrasada/i)).toBeInTheDocument();
  });
});
