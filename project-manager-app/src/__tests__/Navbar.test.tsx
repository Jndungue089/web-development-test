import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { getDoc } from "firebase/firestore";
import Navbar from "@/components/Navbar";

// 🔁 Mocks
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

jest.mock("@/firebase/config", () => ({}));

describe("Navbar", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    // Limpar mocks e configurar router
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("renderiza logo e botões principais", () => {
    (onAuthStateChanged as jest.Mock).mockImplementation((_auth, cb) => {
      cb(null); // Usuário deslogado
      return () => {};
    });

    render(<Navbar />);

    expect(screen.getByText("PMS")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Sobre")).toBeInTheDocument();
    expect(screen.getByText("Features")).toBeInTheDocument();
    expect(screen.getByText("Contacto")).toBeInTheDocument();
    expect(screen.getByText("Entrar")).toBeInTheDocument();
  });

  it("muda o tema quando o botão de alternar tema é clicado", () => {
    (onAuthStateChanged as jest.Mock).mockImplementation((_auth, cb) => {
      cb(null);
      return () => {};
    });

    render(<Navbar />);
    const toggleButton = screen.getByLabelText("Alternar tema");

    fireEvent.click(toggleButton);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("exibe menu de perfil quando logado", async () => {
    const mockUser = { uid: "123", email: "user@example.com", displayName: "José Usuário" };

    (onAuthStateChanged as jest.Mock).mockImplementation((_auth, cb) => {
      cb(mockUser);
      return () => {};
    });

    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({
        name: "José Teste",
      }),
    });

    render(<Navbar />);

    // Aguarda o nome do usuário aparecer
    await waitFor(() => {
      expect(screen.getByText("José")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("José"));

    expect(await screen.findByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Sair")).toBeInTheDocument();
  });
});
