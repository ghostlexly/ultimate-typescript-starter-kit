import { getCookie, setCookie, deleteCookie } from "cookies-next";

// Constants
const ACCESS_TOKEN_COOKIE = "lunisoft_access_token";
const REFRESH_TOKEN_COOKIE = "lunisoft_refresh_token";

// Token getters
const getClientAccessToken = async () => {
  const accessToken = getCookie(ACCESS_TOKEN_COOKIE);

  if (accessToken) {
    return accessToken;
  } else {
    const refreshResponse = await refreshClientTokens();

    if (refreshResponse) {
      return refreshResponse.accessToken;
    }

    return null;
  }
};

// Remove both tokens at once
const removeClientTokens = () => {
  deleteCookie(ACCESS_TOKEN_COOKIE);
  deleteCookie(REFRESH_TOKEN_COOKIE);
};

const refreshClientTokens = async () => {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
    }).then(async (res) => await res.json());

    // setCookie(ACCESS_TOKEN_COOKIE, response.accessToken);
    // setCookie(REFRESH_TOKEN_COOKIE, response.refreshToken);

    return {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    };
  } catch (error) {
    removeClientTokens();
    return false;
  }
};

export { getClientAccessToken, removeClientTokens, refreshClientTokens };
