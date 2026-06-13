import type { AdminUser } from "./types";

const USER_KEY = "user";

export const saveAuth = (user: AdminUser) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getAuth = (): AdminUser | null => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const clearAuth = () => {
  localStorage.removeItem(USER_KEY);
};
