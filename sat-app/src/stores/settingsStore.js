import { create } from 'zustand'

export const useSettingsStore = create((set) => ({
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
  model: 'openai/gpt-4o-mini',
  setApiKey: (key) => set({ apiKey: key }),
  setModel: (model) => set({ model }),
}))
