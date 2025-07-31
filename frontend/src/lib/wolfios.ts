import axios, { InternalAxiosRequestConfig } from "axios";

const wolfios = axios.create({
  adapter: ["fetch", "xhr", "http"],
});

wolfios.interceptors.request.use(
  async (request: InternalAxiosRequestConfig) => {
    request.headers.set("User-Agent", false); // disable subsequent setting the default header by Axios

    return request;
  }
);

export { wolfios };
