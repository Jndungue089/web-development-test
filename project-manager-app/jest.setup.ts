import "@testing-library/jest-dom";
import 'whatwg-fetch';

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "fake-api-key";
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test-project";