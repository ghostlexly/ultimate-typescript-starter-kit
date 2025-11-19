import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const wolfios = axios.create({
  adapter: ["fetch", "xhr", "http"],
  timeout: 30000,
});

wolfios.interceptors.request.use(
  async (request: InternalAxiosRequestConfig) => {
    request.headers.set("User-Agent", false); // disable subsequent setting the default header by Axios

    return request;
  }
);

wolfios.interceptors.response.use(
  async (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      await wolfios.post("/api/auth/refresh");
    }

    return Promise.reject(error); // important to propagate the error
  }
);

export { wolfios };
