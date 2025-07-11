import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import dotenv from "dotenv";

// Force Node.js Runtime for middleware
export const config = {
  matcher: [
    "/auth/login",
    "/auth/register",
    "/",
    "/dashboard/:path*",
    "/account",
    "/dashboard/projects/:path*",
  ],
  runtime: "nodejs", // Explicitly use Node.js Runtime
};

// Load environment variables in development
if (process.env.NODE_ENV === "development") {
  dotenv.config();
}

// Initialize Firebase Admin SDK (only initialize if not already initialized)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authHeader = request.headers.get("authorization");
  let isAuthenticated = false;

  // Check if user is authenticated by verifying Firebase ID token
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const idToken = authHeader.split("Bearer ")[1];
    try {
      await getAuth().verifyIdToken(idToken);
      isAuthenticated = true;
    } catch (error) {
      console.error("Error verifying ID token:", error);
      isAuthenticated = false;
    }
  }

  // Routes that logged-in users cannot access
  const publicRoutes = ["/auth/login", "/auth/register", "/"];

  // Routes that require authentication
  const protectedRoutes = ["/dashboard", "/account", "/dashboard/projects"];

  // Handle logged-in users
  if (isAuthenticated) {
    if (publicRoutes.includes(pathname) || pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next(); // Allow access to protected routes
  }

  // Handle non-logged-in users
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next(); // Allow access to public routes
}