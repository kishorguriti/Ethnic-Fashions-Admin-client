// import { configureStore } from "@reduxjs/toolkit";
// import authReducer from "../features/auth/authSlice";
// import cartReducer from "../features/cart/cartSlice";

// export const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     cart: cartReducer,
//   },
// });

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
// import cartReducer from "./features/cart/cartSlice";
// import productReducer from "./features/products/productSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // cart: cartReducer,
    // products: productReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
