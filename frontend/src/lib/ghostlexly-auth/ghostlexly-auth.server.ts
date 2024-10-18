"use server";

import { cookies } from "next/headers";
import { wolfios } from "../wolfios";

const ME_ROUTE = "/api/me";
const COOKIE_EXPIRE_IN_DAYS = 7;

type getSessionProps = {
  userDataUrl?: string;
};

type SessionData = {
  status: SessionStatus;
  data: any;
};

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

const getServerToken = async () => {
  return cookies().get("ghostlexly_session")?.value;
};

const getSession = async ({
  userDataUrl = ME_ROUTE,
}: getSessionProps = {}): Promise<SessionData> => {
  let finalUrl = userDataUrl;

  // ------------------------------------------------
  // Get the token from the cookie
  // ------------------------------------------------
  const token = await getServerToken();

  // if there is no token, return we are unauthenticated
  if (!token)
    return {
      status: "unauthenticated",
      data: null,
    };

  // ------------------------------------------------
  // We are on the server, we need to use the nginx proxy
  // ------------------------------------------------
  finalUrl = `http://nginx${userDataUrl}`;

  // ------------------------------------------------
  // Fetch the user data
  // ------------------------------------------------
  const { data, error } = await wolfios
    .get(finalUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(async (res) => await res.json())
    .then((data) => ({ data: data, error: null }))
    .catch((error) => ({ data: null, error }));

  if (!data || error) {
    return {
      status: "unauthenticated",
      data: null,
    };
  }

  return {
    status: "authenticated",
    data: data,
  };
};

const createSession = async (value: string) => {
  cookies().set("ghostlexly_session", value, {
    path: "/",
    maxAge: 60 * 60 * 24 * COOKIE_EXPIRE_IN_DAYS,
  });
};

const destroySession = async () => {
  cookies().delete("ghostlexly_session");
};

export { getSession, createSession, destroySession, getServerToken };
