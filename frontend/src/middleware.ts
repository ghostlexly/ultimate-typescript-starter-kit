import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "./lib/ghostlexly-auth/ghostlexly-auth.server";

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

const supportedLocales = ["fr", "en"];
const defaultLocale = "fr";

/**
 * Detects user locale from Accept-Language header and sets NEXT_LOCALE cookie
 */
function localeDetectionMiddleware(request: NextRequest): NextResponse | null {
  // Check if locale is already set in cookie
  const localeFromCookie = request.cookies.get("NEXT_LOCALE")?.value;

  if (localeFromCookie && supportedLocales.includes(localeFromCookie)) {
    // Locale already set, continue to next middleware
    return null;
  }

  // Detect locale from Accept-Language header
  const acceptLanguage = request.headers.get("accept-language");
  let detectedLocale = defaultLocale;

  if (acceptLanguage) {
    // Parse Accept-Language header (e.g., "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7")
    const languages = acceptLanguage.split(",").map((lang) => {
      const [code] = lang.trim().split(";");
      return code.split("-")[0].toLowerCase();
    });

    // Find first supported language
    detectedLocale =
      languages.find((lang) => supportedLocales.includes(lang)) ||
      defaultLocale;
  }

  // Set cookie with detected locale
  const response = NextResponse.next();
  response.cookies.set("NEXT_LOCALE", detectedLocale, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });

  return response;
}

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

  return null;
}

// =============================================================================
// Main Middleware Export
// =============================================================================

export const middleware = chain([
  localeDetectionMiddleware,
  authenticationMiddleware,
]);

export const config = {
  matcher: ["/:path*"],
};
