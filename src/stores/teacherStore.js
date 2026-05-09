import { create } from "zustand"
import { INITIAL_TEACHERS } from "../data/initialTeachers"

function fallbackToLocal(set) {
  try {
    const saved = localStorage.getItem("lr_teachers")
    if (saved) {
      const teachers = JSON.parse(saved)
      if (teachers.length) {
        set({ teachers, initialized: true })
        return
      }
    }
  } catch {}
  // 最终兜底到初始数据
  set({ teachers: INITIAL_TEACHERS, initialized: true })
}

const useTeacherStore = create((set, get) => ({
  teachers: [],
  loading: false,
  initialized: false,
  error: null,

  fetchTeachers: async () => {
    if (get().loading) return
    set({ loading: true, error: null })
    try {
      const resp = await fetch("/api/teachers")
      const data = await resp.json()
      if (data.success && data.teachers) {
        set({ teachers: data.teachers, initialized: true })
        // 同步到 localStorage
        localStorage.setItem("lr_teachers", JSON.stringify(data.teachers))
        return
      }
      // API 返回错误时 fallback 到本地缓存
      set({ error: data.error || "加载失败" })
      fallbackToLocal(set)
    } catch (err) {
      console.warn("从 API 加载教师列表失败，使用本地缓存:", err.message)
      set({ error: "网络错误，使用本地缓存" })
      fallbackToLocal(set)
    } finally {
      set({ loading: false })
    }
  },

  getByGrade: (grade) => get().teachers.filter(t => t.grade === grade),
  getGroupLeaders: () => get().teachers.filter(t => t.group === "组长"),
  getById: (id) => get().teachers.find(t => t.id === id),

  addTeacher: async (teacher) => {
    const newTeacher = { ...teacher, id: teacher.id || `ML${Date.now()}` }
    try {
      const resp = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTeacher),
      })
      const data = await resp.json()
      if (data.success) {
        const updated = [...get().teachers, newTeacher]
        set({ teachers: updated })
        localStorage.setItem("lr_teachers", JSON.stringify(updated))
        return newTeacher
      }
      console.error("添加教师失败:", data.error)
      alert("添加失败: " + (data.error || "未知错误"))
    } catch (err) {
      console.error("添加教师失败:", err)
      alert("网络错误，请检查网络连接后重试")
    }
    return null
  },

  updateTeacher: async (id, updates) => {
    const current = get().teachers.find(t => t.id === id)
    if (!current) return
    const merged = { ...current, ...updates }
    try {
      const resp = await fetch("/api/teachers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merged),
      })
      const data = await resp.json()
      if (data.success) {
        const updated = get().teachers.map(t => t.id === id ? merged : t)
        set({ teachers: updated })
        localStorage.setItem("lr_teachers", JSON.stringify(updated))
      } else {
        console.error("更新教师失败:", data.error)
        alert("更新失败: " + (data.error || "未知错误"))
      }
    } catch (err) {
      console.error("更新教师失败:", err)
      alert("网络错误，请检查网络连接后重试")
    }
  },

  deleteTeacher: async (id) => {
    try {
      const resp = await fetch(`/api/teachers?id=${id}`, { method: "DELETE" })
      const data = await resp.json()
      if (data.success) {
        const updated = get().teachers.filter(t => t.id !== id)
        set({ teachers: updated })
        localStorage.setItem("lr_teachers", JSON.stringify(updated))
      } else {
        console.error("删除教师失败:", data.error)
        alert("删除失败: " + (data.error || "未知错误"))
      }
    } catch (err) {
      console.error("删除教师失败:", err)
      alert("网络错误，请检查网络连接后重试")
    }
  },

  getGradeStats: () => {
    const teachers = get().teachers.filter(t => t.role !== "admin")
    const stats = {}
    for (const t of teachers) {
      if (!stats[t.grade]) stats[t.grade] = { total: 0, leaders: 0 }
      stats[t.grade].total++
      if (t.group === "组长") stats[t.grade].leaders++
    }
    return stats
  },
}))

export default useTeacherStore