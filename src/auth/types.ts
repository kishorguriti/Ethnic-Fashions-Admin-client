export type Role = "super_admin" | "admin" | "partner";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: AdminUser;
  };
}

// Step 1 of login — credentials verified, OTP sent
export interface OtpRequiredResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
  };
  // Only present in development
  OTP?: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}
