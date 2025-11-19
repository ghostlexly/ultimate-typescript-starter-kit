"use server";

import { cookies } from "next/headers";
import { wolfios } from "../wolfios";

const ACCESS_TOKEN_COOKIE = "lunisoft_access_token";
const REFRESH_TOKEN_COOKIE = "lunisoft_refresh_token";
const ME_ROUTE = "http://caddy/api/auth/me";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

type SessionData = {
  status: SessionStatus;
  data: any;
};

// Destroy session by deleting cookies
const removeServerTokens = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
};

// Get user session data from the API
const getSession = async (userDataUrl = ME_ROUTE): Promise<SessionData> => {
  const cookieStore = await cookies();
  const token =
    cookieStore.get(ACCESS_TOKEN_COOKIE) ??
    cookieStore.get(REFRESH_TOKEN_COOKIE);

  // If no token, return unauthenticated
  if (!token) {
    return {
      status: "unauthenticated",
      data: null,
    };
  }

  // Fetch the user data
  try {
    const data = await wolfios
      .get(userDataUrl, {
        headers: {
          Authorization: `Bearer ${token?.value}`,
        },
      })
      .then((res) => res.data);

    return {
      status: "authenticated",
      data,
    };
  } catch (error) {
    return {
      status: "unauthenticated",
      data: null,
    };
  }
};

export { getSession, removeServerTokens };
