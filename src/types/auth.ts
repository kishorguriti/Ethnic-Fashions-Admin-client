// src/types/auth.ts
export type Role = "admin" | "customer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  token: string;
}