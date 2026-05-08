import { create } from "zustand"

const useTeacherStore = create((set, get) => ({
  teachers: [],
  loading: false,
  initialized: false,

  // 从 WPS 多维表加载教师列表
  fetchTeachers: async () => {
    if (get().loading) return
    set({ loading: true })
    try {
      const resp = await fetch("/api/teachers")
      const data = await resp.json()
      if (data.success) {
        set({ teachers: data.teachers, initialized: true })
      }
    } catch (err) {
      console.error("加载教师列表失败:", err)
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
        set({ teachers: [...get().teachers, newTeacher] })
        return newTeacher
      }
    } catch (err) {
      console.error("添加教师失败:", err)
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
        set({
          teachers: get().teachers.map(t => t.id === id ? merged : t),
        })
      }
    } catch (err) {
      console.error("更新教师失败:", err)
    }
  },

  deleteTeacher: async (id) => {
    try {
      await fetch(`/api/teachers?id=${id}`, { method: "DELETE" })
      set({ teachers: get().teachers.filter(t => t.id !== id) })
    } catch (err) {
      console.error("删除教师失败:", err)
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
