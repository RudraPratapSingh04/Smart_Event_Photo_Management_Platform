import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null, // Stores user info (e.g., username, id)
  isLoggedIn: false, // Boolean flag for logged-in status
  token: null, // Stores a JWT or session token
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
    },
  },
});

export const { login, logout } = authSlice.actions;

// Selector to access the logged-in status
export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;

export default authSlice.reducer;
