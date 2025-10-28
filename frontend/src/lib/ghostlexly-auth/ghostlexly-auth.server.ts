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

// Get server-side token functions
const getServerAccessToken = async () => {
  const cookieStore = await cookies();

  if (cookieStore.get(ACCESS_TOKEN_COOKIE)) {
    return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  } else {
    const refreshResponse = await refreshServerTokens();

    if (refreshResponse) {
      return refreshResponse.accessToken;
    }
  }

  return null;
};

// Destroy session by deleting cookies
const removeServerTokens = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
};

const refreshServerTokens = async () => {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

    if (!refreshToken) {
      return false;
    }

    const response = await fetch("http://caddy/api/auth/refresh", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }).then(async (res) => await res.json());

    return {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    };
  } catch (error) {
    await removeServerTokens();
    return false;
  }
};

// Get user session data from the API
const getSession = async (userDataUrl = ME_ROUTE): Promise<SessionData> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE);
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE);

  // If no token, return unauthenticated
  if (!accessToken && !refreshToken) {
    return {
      status: "unauthenticated",
      data: null,
    };
  }

  // Fetch the user data
  try {
    const data = await wolfios.get(userDataUrl).then((res) => res.data);

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

export {
  getSession,
  refreshServerTokens,
  removeServerTokens,
  getServerAccessToken,
};
