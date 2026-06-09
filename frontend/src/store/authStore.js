import { create } from 'zustand';
import { authApi } from '../api';

const useAuthStore = create((set, get) => ({
  user: null,
  tokens: JSON.parse(localStorage.getItem('cf_tokens') || 'null'),
  isLoading: false,
  isInitialized: false,

  // Initialize — fetch user if token exists
  initialize: async () => {
    const tokens = JSON.parse(localStorage.getItem('cf_tokens') || 'null');
    if (!tokens?.access) {
      set({ isInitialized: true });
      return;
    }
    try {
      const { data } = await authApi.me();
      set({ user: data, tokens, isInitialized: true });
    } catch {
      localStorage.removeItem('cf_tokens');
      set({ user: null, tokens: null, isInitialized: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await authApi.login({ email, password });
      const tokens = { access: data.access, refresh: data.refresh };
      localStorage.setItem('cf_tokens', JSON.stringify(tokens));
      const { data: user } = await authApi.me();
      set({ user, tokens, isLoading: false });
      return { success: true };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, error: err.response?.data };
    }
  },

  register: async (formData) => {
    set({ isLoading: true });
    try {
      const { data } = await authApi.register(formData);
      const tokens = { access: data.access, refresh: data.refresh };
      localStorage.setItem('cf_tokens', JSON.stringify(tokens));
      const { data: user } = await authApi.me();
      set({ user, tokens, isLoading: false });
      return { success: true };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, error: err.response?.data };
    }
  },

  googleLogin: async (accessToken) => {
    set({ isLoading: true });
    try {
      const { data } = await authApi.googleLogin(accessToken);
      const tokens = { access: data.access, refresh: data.refresh };
      localStorage.setItem('cf_tokens', JSON.stringify(tokens));
      const { data: user } = await authApi.me();
      set({ user, tokens, isLoading: false });
      return { success: true };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, error: err.response?.data };
    }
  },

  logout: async () => {
    try {
      const tokens = get().tokens;
      if (tokens?.refresh) await authApi.logout({ refresh: tokens.refresh });
    } catch {}
    localStorage.removeItem('cf_tokens');
    set({ user: null, tokens: null });
  },

  updateUser: (userData) => set({ user: userData }),

  setLanguage: async (lang) => {
    try {
      await authApi.changeLanguage(lang);
      set((state) => ({ user: { ...state.user, language: lang } }));
    } catch {}
  },

  get isAuthenticated() {
    return !!get().user;
  },
}));

export default useAuthStore;
