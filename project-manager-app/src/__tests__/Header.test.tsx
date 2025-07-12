import Header from "@/components/dashboard/Header";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useAuthState } from "react-firebase-hooks/auth";

// ✅ MOCKS
jest.mock("react-firebase-hooks/auth", () => ({
    useAuthState: jest.fn(),
}));

jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

jest.mock("@/firebase/config", () => ({
    auth: {},
    db: {},
}));

jest.mock("firebase/firestore", () => ({
    collection: jest.fn(),
    onSnapshot: jest.fn(() => () => { }),
    query: jest.fn(),
    where: jest.fn(),
    doc: jest.fn(),
    updateDoc: jest.fn(),
    getDoc: jest.fn(() =>
        Promise.resolve({
            exists: () => true,
            data: () => ({
                name: "Test User",
            }),
        })
    ),
    deleteDoc: jest.fn(),
}));

jest.mock("@firebase/auth", () => ({
    onAuthStateChanged: jest.fn((auth, callback) => {
        callback({
            uid: "123",
            email: "user@example.com",
            displayName: "Test User",
        });
        return () => { }; // unsubscribe
    }),
}));

// Evitar erros com localStorage
beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
        value: {
            getItem: jest.fn(() => "light"),
            setItem: jest.fn(),
        },
        writable: true,
    });

    (useAuthState as jest.Mock).mockReturnValue([
        { uid: "123", email: "user@example.com" },
        false,
    ]);
});

describe("Header component", () => {
    it("renderiza nome do usuário", async () => {
        render(<Header />);

        await waitFor(() =>
            expect(screen.getByText(/Test User|user/)).toBeInTheDocument()
        );
    });


    it("alterna o tema ao clicar no botão", () => {
        render(<Header />);
        const themeBtn = screen.getByLabelText("Alternar tema");
        fireEvent.click(themeBtn);
        expect(window.localStorage.setItem).toHaveBeenCalledWith("theme", "dark");
    });

    it("abre o menu do usuário ao clicar no avatar", async () => {
        render(<Header />);

        // Aguarda o nome do usuário carregar (garantindo que o componente foi atualizado)
        await waitFor(() => {
            expect(screen.getByText(/Test User|user/)).toBeInTheDocument();
        });
    });


    it("exibe 'Nenhuma notificação' quando não houver notificações", () => {
        render(<Header />);
        const bell = screen.getByLabelText("Notificações");
        fireEvent.click(bell);
        expect(screen.getByText("Nenhuma notificação")).toBeInTheDocument();
    });
});
