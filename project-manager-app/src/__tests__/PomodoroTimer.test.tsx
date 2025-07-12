import PomodoroTimer from "../components/extras/PomodoroTimer";
import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("react-firebase-hooks/auth", () => ({
  useAuthState: () => [null, false], // [user, loading]
}));


// ✅ Mock do Firebase
jest.mock('@/firebase/config', () => ({
  db: {},
  auth: {
    onAuthStateChanged: jest.fn(), 
  },
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  updateDoc: jest.fn(),
  arrayUnion: jest.fn(),
  serverTimestamp: jest.fn(),
}));

// ✅ Mock dos componentes filhos
jest.mock("@/components/extras/Pomodoro/PomodoroControls", () => ({
  PomodoroControls: () => <div data-testid="PomodoroControls">PomodoroControls</div>,
}));

jest.mock("../components/extras/Pomodoro/PomodoroCounter", () => ({
  PomodoroCounter: () => <div data-testid="PomodoroCounter">PomodoroCounter</div>,
}));

describe("PomodoroTimer", () => {
  const tasks = [
    { id: "1", title: "Estudar React", status: "pending" },
    { id: "2", title: "Escrever testes", status: "in_progress" },
    { id: "3", title: "Finalizar projeto", status: "completed" },
  ];

  it("exibe lista de tarefas pendentes", () => {
    render(<PomodoroTimer projectId="project1" tasks={tasks} />);

    expect(screen.getByText("Selecione uma tarefa para focar")).toBeInTheDocument();
    expect(screen.getByText("Estudar React")).toBeInTheDocument();
    expect(screen.queryByText("Finalizar projeto")).not.toBeInTheDocument(); // completada
  });

  it("inicia modo Pomodoro ao selecionar tarefa", () => {
    render(<PomodoroTimer projectId="project1" tasks={tasks} />);

    fireEvent.click(screen.getByText("Estudar React"));

    expect(screen.getByText("Tarefa atual:")).toBeInTheDocument();
    expect(screen.getByText("Estudar React")).toBeInTheDocument();
    expect(screen.getByText("Foco")).toBeInTheDocument();
    expect(screen.getByTestId("PomodoroControls")).toBeInTheDocument();
    expect(screen.getByTestId("PomodoroCounter")).toBeInTheDocument();
  });

  it("exibe botão de marcar como concluída apenas no modo foco", () => {
    render(<PomodoroTimer projectId="project1" tasks={tasks} />);
    fireEvent.click(screen.getByText("Estudar React"));

    expect(screen.getByText("Marcar como concluída")).toBeInTheDocument();
  });

  it("exibe mensagem de pausa longa corretamente", () => {
    render(<PomodoroTimer projectId="project1" tasks={tasks} />);
    fireEvent.click(screen.getByText("Estudar React"));

    expect(screen.getByText(/Pausa longa em/)).toBeInTheDocument();
  });
});
