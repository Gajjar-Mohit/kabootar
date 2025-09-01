import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/conversations(.*)"]);
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const url = req.nextUrl;

  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Redirect authenticated users from public routes to conversations
  if (userId && isPublicRoute(req) && url.pathname !== "/conversations") {
    // Don't redirect if they're on sign-in/sign-up pages (let Clerk handle it)
    if (
      !url.pathname.startsWith("/sign-in") &&
      !url.pathname.startsWith("/sign-up")
    ) {
      return NextResponse.redirect(new URL("/conversations", req.url));
    }
  }

  // Redirect unauthenticated users trying to access protected routes
  if (!userId && isProtectedRoute(req)) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
