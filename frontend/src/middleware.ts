import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "./lib/ghostlexly-auth/ghostlexly-auth.server";

const ACCESS_TOKEN_COOKIE = "lunisoft_access_token";
const REFRESH_TOKEN_COOKIE = "lunisoft_refresh_token";

/**
 * Attempt to refresh the access token using the refresh token
 */
const refreshAccessToken = async (
  request: NextRequest
): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> => {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    return { accessToken: null, refreshToken: null };
  }

  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://caddy/api";
    const response = await fetch(`${backendUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${REFRESH_TOKEN_COOKIE}=${refreshToken}`,
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return { accessToken: null, refreshToken: null };
    }

    const data = await response.json();

    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  } catch (error) {
    console.error("Token refresh failed:", error);

    return { accessToken: null, refreshToken: null };
  }
};

export const middleware = async (request: NextRequest) => {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE);
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE);
  const isAdminAuthPage =
    request.nextUrl.pathname.startsWith("/admin-area/signin");
  const isAdminArea = request.nextUrl.pathname.startsWith("/admin-area");

  // --------------------------------------------------------------------------
  // Refresh Access Token
  // --------------------------------------------------------------------------
  if (!accessToken && refreshToken) {
    const tokens = await refreshAccessToken(request);

    if (tokens.accessToken && tokens.refreshToken) {
      // Clone the response and set new cookies
      const response = NextResponse.next();

      response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60, // 15 minutes
      });

      response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 24 * 60 * 60, // 60 days
      });

      return response;
    }
  }

  if (isAdminArea || isAdminAuthPage) {
    const session = await getSession();

    // --------------------------------------------------------------------------
    // Admin Area
    // --------------------------------------------------------------------------
    if (isAdminArea && !isAdminAuthPage) {
      // If not logged-in, redirect to signin page
      if (session.status === "unauthenticated") {
        return NextResponse.redirect(
          new URL("/admin-area/signin", request.url)
        );
      }
    } else if (isAdminAuthPage) {
      // If logged-in, redirect to admin area
      if (
        session.status === "authenticated" &&
        session.data?.role.includes("ADMIN")
      ) {
        return NextResponse.redirect(new URL("/admin-area", request.url));
      }
    }
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/:path*"],
};
