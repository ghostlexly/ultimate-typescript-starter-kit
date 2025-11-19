import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "./lib/ghostlexly-auth/ghostlexly-auth.server";

export const middleware = async (request: NextRequest) => {
  const isAdminAuthPage =
    request.nextUrl.pathname.startsWith("/admin-area/signin");
  const isAdminArea = request.nextUrl.pathname.startsWith("/admin-area");

  if (isAdminArea || isAdminAuthPage) {
    const session = await getServerSession();

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
