import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  isLoggedIn: false,
  username: '',
  login: (username) => set({ isLoggedIn: true, username }),
  logout: () => set({ isLoggedIn: false, username: '' }),
}))
