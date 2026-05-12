import { create } from 'zustand'

export const useSettingsStore = create((set) => ({
  apiKey: 'replace-this-dummy-string-here',
  setApiKey: (key) => set({ apiKey: key }),
}))
