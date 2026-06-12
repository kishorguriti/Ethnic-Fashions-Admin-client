// // // src/features/auth/authSlice.ts
// // import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// // import { User } from "../../types/auth";

// // interface AuthState {
// //   user: User | null;
// // }

// // const initialState: AuthState = {
// //   user: null,
// // };

// // const authSlice = createSlice({
// //   name: "auth",
// //   initialState,
// //   reducers: {
// //     login: (state, action: PayloadAction<User>) => {
// //       state.user = action.payload;
// //     },
// //     logout: (state) => {
// //       state.user = null;
// //     },
// //   },
// // });

// // export const { login, logout } = authSlice.actions;
// // export default authSlice.reducer;
// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// export type Role = "admin" | "customer";

// interface User {
//   id: string;
//   name: string;
//   role: Role;
// }

// interface AuthState {
//   user: User | null;
// }

// const initialState: AuthState = {
//   user: null,
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     login: (state, action: PayloadAction<User>) => {
//       state.user = action.payload;
//     },
//     logout: (state) => {
//       state.user = null;
//     },
//   },
// });

// export const { login, logout } = authSlice.actions;
// export default authSlice.reducer;
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface User {
  id: string;
  email: string;
  role: string;
  // role: "admin" | "customer";
}

interface AuthState {
  user: User | null;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem("user") || "null"),
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (data: { email: string; password: string; remember: boolean }) => {
    const isAdmin = data.email === "admin@test.com";

    const user = {
      id: "1",
      email: data.email,
      role: isAdmin ? "admin" : "customer",
    };

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", "demo-token");

    return user;
  },
);

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.clear();
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.user = action.payload as {
        id: string;
        email: string;
        role: string;
      };
    });
  },
});

export const { logout } = slice.actions;
export default slice.reducer;
