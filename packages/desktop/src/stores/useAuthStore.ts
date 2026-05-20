import { create } from 'zustand'

interface AuthState {
  isLoggedIn: boolean
  username: string
  login: (username: string, password: string) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  username: '',

  login: (username: string, password: string) => {
    if (username === 'admin' && password === 'admin') {
      set({ isLoggedIn: true, username })
      return true
    }
    return false
  },

  logout: () => set({ isLoggedIn: false, username: '' }),
}))
