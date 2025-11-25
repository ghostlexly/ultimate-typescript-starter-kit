import axios, { AxiosError, AxiosResponse } from "axios";
import { cookies } from "next/headers";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "../luni-auth/luni-auth.server";

/**
 * Wolfios Server - Axios instance for Next.js Server Components
 *
 * This instance automatically forwards cookies from the incoming request to backend API calls.
 * Use this ONLY in Server Components, Server Actions, and Route Handlers.
 *
 * @example
 * ```ts
 * import { wolfiosServer } from "@/lib/wolfios/wolfios.server";
 *
 * export default async function Page() {
 *   const data = await wolfiosServer.get("/api/data").then(res => res.data);
 *   return <div>{data}</div>;
 * }
 * ```
 */
const wolfiosServer = axios.create({
  baseURL: "http://caddy",
  adapter: ["fetch", "http"],
  timeout: 30000,
});

wolfiosServer.interceptors.request.use(async (request) => {
  // Disable subsequent setting the default header by Axios
  request.headers.set("User-Agent", false);

  // Auto-forward cookies from the incoming request
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get(ACCESS_TOKEN_COOKIE) ??
      cookieStore.get(REFRESH_TOKEN_COOKIE);

    if (token) {
      request.headers.set("Authorization", `Bearer ${token?.value}`);
    }
  } catch (error) {
    // If cookies() fails, continue without them
    console.error("Failed to get cookies in wolfiosServer:", error);
  }

  return request;
});

wolfiosServer.interceptors.response.use(
  async (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    // For server-side, we don't retry on 401
    // The server component will fail and Next.js will handle it
    return Promise.reject(error);
  }
);

export { wolfiosServer };
