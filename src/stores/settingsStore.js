import { create } from "zustand"

const STORAGE_KEY = "lr_settings"

const DEFAULT_SETTINGS = {
  zhipuApiKey: "3558d21721a04e9f9570decd7787ccb8.zPnxktNkW2OFexGL",
  zhipuModel: "glm-4-flash",
  zhipuApiUrl: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
  passScore: 85,
  wpsSid: "",
}

function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
  } catch {}
  return DEFAULT_SETTINGS
}

function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

const useSettingsStore = create((set, get) => ({
  settings: loadSettings(),

  getZhipuApiKey: () => get().settings.zhipuApiKey,
  getZhipuModel: () => get().settings.zhipuModel,
  getZhipuApiUrl: () => get().settings.zhipuApiUrl,
  getPassScore: () => get().settings.passScore,
  getWpsSid: () => get().settings.wpsSid,

  updateSettings: (updates) => {
    const settings = { ...get().settings, ...updates }
    saveSettings(settings)
    set({ settings })
  },

  resetToDefault: () => {
    saveSettings(DEFAULT_SETTINGS)
    set({ settings: DEFAULT_SETTINGS })
  }
}))

export default useSettingsStore
export { DEFAULT_SETTINGS }
