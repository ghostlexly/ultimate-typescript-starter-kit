"use server";

import { redirect } from "next/navigation";
import { getSession } from "./ghostlexly-auth.server";

type AuthGuardResult = { status: "authenticated" } | { status: "error" };

/**
 * Server-side authentication guard
 * Redirects if user is not authenticated or lacks required roles
 */
export const authGuard = async ({
  requiredRoles = [],
  redirectPath = "/",
}: {
  requiredRoles?: string[];
  redirectPath?: string;
}): Promise<AuthGuardResult> => {
  const session = await getSession();

  // Redirect unauthenticated users
  if (session.status === "unauthenticated") {
    redirect(redirectPath);
  }

  if (session.status === "authenticated") {
    // If no specific roles required, allow access
    if (requiredRoles.length === 0) {
      return { status: "authenticated" };
    }

    // Check if user has any of the required roles
    const hasRequiredRole = requiredRoles.some((role) =>
      session.data.role.includes(role)
    );

    // Redirect if user lacks required role
    if (!hasRequiredRole) {
      redirect(redirectPath);
    }

    return { status: "authenticated" };
  }

  return { status: "error" };
};
