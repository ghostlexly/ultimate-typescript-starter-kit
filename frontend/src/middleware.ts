import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "./lib/luni-auth/luni-auth.server";

// =============================================================================
// Types
// =============================================================================

type MiddlewareFactory = (
  request: NextRequest
) => Promise<NextResponse | null> | NextResponse | null;

// =============================================================================
// Middleware Chain Helper
// =============================================================================

/**
 * Chains multiple middlewares together and merges their responses
 * @param middlewares - Array of middleware functions to chain
 * @returns Combined middleware function
 */
function chain(middlewares: MiddlewareFactory[]) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const response = NextResponse.next();

    for (const middleware of middlewares) {
      const middlewareResponse = await middleware(request);

      if (middlewareResponse) {
        // If middleware returns a redirect, merge cookies and return immediately
        if (
          middlewareResponse.status >= 300 &&
          middlewareResponse.status < 400
        ) {
          // Merge cookies from previous responses
          response.cookies.getAll().forEach((cookie) => {
            middlewareResponse.cookies.set(cookie.name, cookie.value, {
              maxAge: 60 * 60 * 24 * 365,
              path: "/",
            });
          });
          return middlewareResponse;
        }

        // Merge cookies from non-redirect responses
        middlewareResponse.cookies.getAll().forEach((cookie) => {
          response.cookies.set(cookie.name, cookie.value, {
            maxAge: 60 * 60 * 24 * 365,
            path: "/",
          });
        });
      }
    }

    return response;
  };
}

// =============================================================================
// Middleware Functions
// =============================================================================

/**
 * Protects admin area routes and handles authentication redirects
 */
async function authenticationMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  const isAdminArea = request.nextUrl.pathname.startsWith("/admin-area");
  const isAdminAuthPage =
    request.nextUrl.pathname.startsWith("/admin-area/signin");

  if (isAdminArea || isAdminAuthPage) {
    const session = await getServerSession();

    // Redirect unauthenticated users to signin page
    if (isAdminArea && !isAdminAuthPage) {
      if (session.status === "unauthenticated") {
        return NextResponse.redirect(
          new URL("/admin-area/signin", request.url)
        );
      }
    }

    // Redirect authenticated admins away from signin page
    if (isAdminAuthPage) {
      if (
        session.status === "authenticated" &&
        session.data?.role.includes("ADMIN")
      ) {
        return NextResponse.redirect(new URL("/admin-area", request.url));
      }
    }
  }

  const isCustomerArea = request.nextUrl.pathname.startsWith("/customer-area");
  const isCustomerAuthPage = request.nextUrl.pathname.startsWith(
    "/customer-area/signin"
  );

  if (isCustomerArea || isCustomerAuthPage) {
    const session = await getServerSession();

    // Redirect unauthenticated users to signin page
    if (isCustomerArea && !isCustomerAuthPage) {
      if (session.status === "unauthenticated") {
        return NextResponse.redirect(
          new URL("/customer-area/signin", request.url)
        );
      }
    }

    // Redirect authenticated customers away from signin page
    if (isCustomerAuthPage) {
      if (
        session.status === "authenticated" &&
        session.data?.role.includes("CUSTOMER")
      ) {
        return NextResponse.redirect(new URL("/customer-area", request.url));
      }
    }
  }

  return null;
}

// =============================================================================
// Main Middleware Export
// =============================================================================

export const middleware = chain([authenticationMiddleware]);

export const config = {
  matcher: ["/:path*"],
};
