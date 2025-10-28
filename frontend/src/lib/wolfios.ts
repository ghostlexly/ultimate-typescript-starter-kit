import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import {
  getClientAccessToken,
  refreshClientTokens,
  removeClientTokens,
} from "./ghostlexly-auth/ghostlexly-auth.client";
import {
  getServerAccessToken,
  refreshServerTokens,
} from "./ghostlexly-auth/ghostlexly-auth.server";

const getAccessToken = async () => {
  const isServer = typeof window === "undefined";
  return isServer ? await getServerAccessToken() : await getClientAccessToken();
};

const refreshTokens = async () => {
  const isServer = typeof window === "undefined";
  return isServer ? await refreshServerTokens() : await refreshClientTokens();
};

const wolfios = axios.create({
  adapter: ["fetch", "xhr", "http"],
  timeout: 30000,
});

wolfios.interceptors.request.use(
  async (request: InternalAxiosRequestConfig) => {
    request.headers.set("User-Agent", false); // disable subsequent setting the default header by Axios

    // Get the access token and set Authorization header
    const accessToken = await getAccessToken();
    if (accessToken) {
      request.headers.Authorization = `Bearer ${accessToken}`;
    }

    return request;
  }
);

wolfios.interceptors.response.use(
  async (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      await refreshTokens();
    }

    return Promise.reject(error); // important to propagate the error
  }
);

export { wolfios };
