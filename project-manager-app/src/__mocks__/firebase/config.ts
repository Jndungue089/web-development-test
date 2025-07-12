// __mocks__/firebase/config.ts
export const auth = {
  currentUser: { uid: "mock-user" }
};
export const db = {};
export default {};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "test-key",
  authDomain: "...",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "test-id",
};