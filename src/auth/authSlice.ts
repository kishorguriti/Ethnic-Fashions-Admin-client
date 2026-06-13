import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  loginAPI,
  verifyLoginOtpAPI,
  resendLoginOtpAPI,
  logoutAPI,
} from "./authAPI";
import { saveAuth, getAuth, clearAuth } from "./authService";
import type { AdminUser, LoginPayload, VerifyOtpPayload } from "./types";

interface OtpStep {
  email: string;
  devOtp?: string;
}

interface AuthState {
  user: AdminUser | null;
  status: "idle" | "loading" | "failed";
  error: string | null;
  otpStep: OtpStep | null;
}

const initialState: AuthState = {
  user: getAuth(),
  status: "idle",
  error: null,
  otpStep: null,
};

// Step 1 — validates credentials and triggers an OTP send
export const loginUser = createAsyncThunk(
  "auth/login",
  async (data: LoginPayload, { rejectWithValue }) => {
    try {
      const res = await loginAPI(data);
      return { email: res.data.data.email, devOtp: res.data.OTP };
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Invalid email or password";
      return rejectWithValue(message);
    }
  },
);

// Step 2 — verifies the OTP and completes the session
export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (data: VerifyOtpPayload, { rejectWithValue }) => {
    try {
      const res = await verifyLoginOtpAPI(data);
      const user = res.data.data.user;
      saveAuth(user);
      return user;
    } catch (err: any) {
      const message = err?.response?.data?.message || "Invalid OTP";
      return rejectWithValue(message);
    }
  },
);

export const resendOtp = createAsyncThunk(
  "auth/resendOtp",
  async (email: string, { rejectWithValue }) => {
    try {
      const res = await resendLoginOtpAPI(email);
      return { devOtp: res.data.OTP };
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Failed to resend OTP";
      return rejectWithValue(message);
    }
  },
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  try {
    await logoutAPI();
  } finally {
    clearAuth();
  }
});

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetOtpStep: (state) => {
      state.otpStep = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "idle";
        state.otpStep = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(verifyOtp.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.status = "idle";
        state.user = action.payload;
        state.otpStep = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(resendOtp.pending, (state) => {
        state.error = null;
      })
      .addCase(resendOtp.fulfilled, (state, action) => {
        if (state.otpStep) state.otpStep.devOtp = action.payload.devOtp;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.status = "idle";
        state.otpStep = null;
      });
  },
});

export const { resetOtpStep } = slice.actions;
export default slice.reducer;
