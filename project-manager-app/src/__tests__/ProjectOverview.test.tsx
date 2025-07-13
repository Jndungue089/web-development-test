import ProjectOverview from "@/components/dashboard/project/details/ProjectOverview";
import { render, screen } from "@testing-library/react";

describe("ProjectOverview", () => {
  const mockProject = {
    id: "1",
    title: "Projeto Teste",
    description: "Projeto de teste para overview.",
    status: "TO_DO" as const,
    createdAt: { seconds: 0, nanoseconds: 0, toDate: () => new Date(), toMillis: () => 0, isEqual: () => true, toJSON: () => ({ seconds: 0, nanoseconds: 0, type: "timestamp" }) },
    priority: "medium",
    startDate: { seconds: 0, nanoseconds: 0, toDate: () => new Date(), toMillis: () => 0, isEqual: () => true, toJSON: () => ({ seconds: 0, nanoseconds: 0, type: "timestamp" }) },
    endDate: { seconds: 0, nanoseconds: 0, toDate: () => new Date(), toMillis: () => 0, isEqual: () => true, toJSON: () => ({ seconds: 0, nanoseconds: 0, type: "timestamp" }) },
    owner: "user1",
    members: ["user1", "user2"],
    role: "Owner" as const,
  };

  const stats = {
    totalTasks: 10,
    completedTasks: 5,
    progress: 50,
    overdueTasks: 2,
    highPriorityTasks: 3,
  };

  it("renderiza descrição do projeto", () => {
    render(<ProjectOverview project={mockProject} stats={stats} />);
    expect(screen.getByText("Projeto de teste para overview.")).toBeInTheDocument();
  });

  it("exibe estatísticas de tarefas", () => {
    render(<ProjectOverview project={mockProject} stats={stats} />);
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("50% completo")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
