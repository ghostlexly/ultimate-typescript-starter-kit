"use server";

import { redirect } from "next/navigation";
import { getSession } from "./ghostlexly-auth.server";

const authGuard = async ({
  requiredRoles = [],
  redirectPath = "/",
}: {
  requiredRoles?: string[];
  redirectPath?: string;
}) => {
  const session = await getSession();

  // -- if the session is unauthenticated, we redirect to the login page
  if (session.status === "unauthenticated") {
    return redirect(redirectPath);
  }

  if (session.status === "authenticated") {
    // -- if no roles are required, we can return the status as authenticated
    if (requiredRoles.length === 0) {
      return { status: "authenticated" };
    }

    // -- check if the user has the required roles
    const hasRole = requiredRoles.some((role) =>
      session.data.role.includes(role)
    );

    if (!hasRole) {
      return redirect(redirectPath);
    }

    return { status: "authenticated" };
  }

  return { status: "error" };
};

export { authGuard };
