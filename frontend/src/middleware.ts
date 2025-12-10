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
    for (const middleware of middlewares) {
      const response = await middleware(request);
      if (response) return response;
    }

    return NextResponse.next();
  };
}

// =============================================================================
// Middleware Functions
// =============================================================================

/**
 * Protects admin and customer areas, handles authentication redirects
 */
async function authenticationMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  const isSigninPage = pathname.startsWith("/signin");
  const isAdminArea = pathname.startsWith("/admin-area");
  const isCustomerArea = pathname.startsWith("/customer-area");
  const isCustomerSignupPage = pathname.startsWith("/customer-area/signup");

  // Skip session check if not in a protected area or auth page
  if (!isAdminArea && !isCustomerArea && !isSigninPage) {
    return null;
  }

  const session = await getServerSession();
  const isAuthenticated = session.status === "authenticated";
  const isAdmin = session.data?.role.includes("ADMIN");
  const isCustomer = session.data?.role.includes("CUSTOMER");

  // Admin area: redirect if not admin
  if (isAdminArea && (!isAuthenticated || !isAdmin)) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // Customer area (except signup): redirect if not customer
  if (
    isCustomerArea &&
    !isCustomerSignupPage &&
    (!isAuthenticated || !isCustomer)
  ) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // Auth pages: redirect if already authenticated
  if (isSigninPage || isCustomerSignupPage) {
    if (isAuthenticated && isAdmin) {
      return NextResponse.redirect(new URL("/admin-area", request.url));
    }
    if (isAuthenticated && isCustomer) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return null;
}

// =============================================================================
// Main Middleware Export
// =============================================================================

export const middleware = chain([authenticationMiddleware]);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
