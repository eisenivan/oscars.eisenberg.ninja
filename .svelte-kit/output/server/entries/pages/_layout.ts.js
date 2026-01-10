import { r as redirect } from "../../chunks/index.js";
import { u as user, i as initializing } from "../../chunks/auth.js";
async function load({ url }) {
  let authUser = null;
  let isInit = true;
  const unsubscribeUser = user.subscribe((value) => {
    authUser = value;
  });
  const unsubscribeInit = initializing.subscribe((value) => {
    isInit = value;
  });
  unsubscribeUser();
  unsubscribeInit();
  const publicRoutes = ["/login", "/register"];
  if (isInit) {
    return {};
  }
  if (!authUser && !publicRoutes.includes(url.pathname)) {
    throw redirect(302, "/login");
  }
  if (authUser && publicRoutes.includes(url.pathname)) {
    throw redirect(302, "/");
  }
  return {
    user: authUser
  };
}
export {
  load
};
