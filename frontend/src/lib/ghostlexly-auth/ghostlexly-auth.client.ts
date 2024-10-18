import { getCookie } from "cookies-next";

const getClientToken = () => {
  return getCookie("ghostlexly_session");
};

export { getClientToken };
