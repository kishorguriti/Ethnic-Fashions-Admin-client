import axiosInstance from "../services/axiosInstance";
import type {
  LoginPayload,
  LoginResponse,
  OtpRequiredResponse,
  VerifyOtpPayload,
} from "./types";

// Step 1 — credentials, returns an OTP-sent response (no session yet)
export const loginAPI = (data: LoginPayload) =>
  axiosInstance.post<OtpRequiredResponse>("/admin/login", data);

// Step 2 — verify OTP, completes login and sets auth cookies
export const verifyLoginOtpAPI = (data: VerifyOtpPayload) =>
  axiosInstance.post<LoginResponse>("/admin/login/verify-otp", data);

export const resendLoginOtpAPI = (email: string) =>
  axiosInstance.post<OtpRequiredResponse>("/admin/login/resend-otp", {
    email,
  });

export const logoutAPI = () => axiosInstance.post("/auth/logout");
