import { create } from "zustand"
import { INITIAL_TEACHERS } from "../data/initialTeachers"

const STORAGE_KEY = "lr_auth"

function loadAuth() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return null
}

function saveAuth(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

const initialUser = loadAuth()

const useAuthStore = create((set, get) => ({
  user: initialUser,
  isAuthenticated: !!initialUser,
  isAdmin: initialUser?.role === "admin",

  login: (name, password) => {
    let teachers = []
    try {
      const saved = localStorage.getItem("lr_teachers")
      if (saved) teachers = JSON.parse(saved)
    } catch {}
    if (!teachers.length) teachers = INITIAL_TEACHERS

    const found = teachers.find(
      t => t.name === name && t.password === password
    )
    if (found) {
      const userData = { id: found.id, name: found.name, grade: found.grade, role: found.role, group: found.group }
      saveAuth(userData)
      set({ user: userData, isAuthenticated: true, isAdmin: userData.role === "admin" })
      return { success: true, user: userData }
    }
    return { success: false, message: "姓名或密码错误" }
  },

  logout: () => {
    saveAuth(null)
    set({ user: null, isAuthenticated: false, isAdmin: false })
  },
}))

export default useAuthStore
