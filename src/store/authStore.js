import { create } from "zustand";
import { persist } from "zustand/middleware";
import API from "../api/axios.js";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      //-----------------register---------------------------
      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const { data } = await API.post("/auth/register", userData);
          localStorage.setItem("token", data.token);
          set({
            user: data,
            token: data.token,
            isAuthenticated: true,
            loading: false,
          });
          return data;
        } catch (error) {
          set({
            error: error.response?.data?.message || "Registration failed",
            loading: false,
          });
          throw error;
        }
      },
      //-----------------login--------------------------------------
      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const { data } = await API.post("/auth/login", credentials);
          localStorage.setItem("token", data.token);
          set({
            user: data,
            token: data.token,
            isAuthenticated: true,
            loading: false,
          });
          return data;
        } catch (error) {
          set({
            error: error.response?.data?.message || "Login failed",
            loading: false,
          });
          throw error;
        }
      },

      //------------------logout---------------------------
      logout: () => {
        localStorage.removeItem("token");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      //
      clearError: () => set({ error: null }),
    }),
    //-------------storage detail--------------------
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

export default useAuthStore;
