import { r as redirect } from "../../chunks/index.js";
import { u as user, i as initializing } from "../../chunks/auth.js";
import { g as get_store_value } from "../../chunks/index3.js";
async function load({ url }) {
  const publicRoutes = ["/login", "/register"];
  const isPublicRoute = publicRoutes.includes(url.pathname);
  const authUser = get_store_value(user);
  const isInitializing = get_store_value(initializing);
  if (isInitializing) {
    return {
      user: authUser
    };
  }
  if (authUser && isPublicRoute) {
    throw redirect(302, "/");
  }
  return {
    user: authUser
  };
}
export {
  load
};
