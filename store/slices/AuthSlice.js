import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      sessionStorage.setItem("token", action.payload);
      state.isAuthenticated = true;
    },
    logout: (state) => {
      sessionStorage.removeItem("token");
      state.isAuthenticated = false;
    },
    checkAuth: (state) => {
      const token = sessionStorage.getItem("token");
      state.isAuthenticated = !!token;
    },
  },
});

export const { login, logout, checkAuth } = authSlice.actions;
export default authSlice.reducer;
