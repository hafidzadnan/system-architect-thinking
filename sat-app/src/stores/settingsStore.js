import { create } from 'zustand'

export const useSettingsStore = create((set) => ({
  apiKey: 'AIzaSyCABSPF4GDtB92o2kJQ9_UIjPSF5HwkgCg',
  setApiKey: (key) => set({ apiKey: key }),
}))
