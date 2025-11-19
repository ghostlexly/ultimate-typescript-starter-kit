import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { clearAuthCookies } from "./ghostlexly-auth/ghostlexly-auth.server";

const wolfios = axios.create({
  adapter: ["fetch", "xhr", "http"],
  timeout: 30000,
});

wolfios.interceptors.request.use(
  async (request: InternalAxiosRequestConfig) => {
    // disable subsequent setting the default header by Axios
    request.headers.set("User-Agent", false);

    return request;
  }
);

wolfios.interceptors.response.use(
  async (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    if (
      error.response &&
      error.response.status === 401 &&
      error.config &&
      !error.config.url?.includes("/auth/refresh")
    ) {
      try {
        // Refresh the JWT tokens
        await wolfios.post("/api/auth/refresh");

        // Retry the original request and return the response
        // (error.config contains the original request config (url, method, data, headers, etc.))
        return wolfios(error.config);
      } catch (refreshError) {
        // Clear cookies
        await clearAuthCookies();

        // Refresh the page to clear the session
        window.location.reload();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error); // important to propagate the error
  }
);

export { wolfios };
