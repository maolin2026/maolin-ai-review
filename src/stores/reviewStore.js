import { create } from "zustand"

const STORAGE_KEY = "lr_reviews"
const API_BASE = "/api/reviews"

function loadLocal() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return null
}

function saveLocal(reviews) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews))
  } catch (e) {
    console.warn("保存评课记录到 localStorage 失败:", e)
  }
}

const useReviewStore = create((set, get) => ({
  reviews: [],
  isLoading: false,
  isSynced: false,
  syncError: null,
  initialized: false,

  /**
   * 加载评课记录
   * 优先级: localStorage > API（后台同步）
   * localStorage 是主数据源，手动新增的评课不会因部署/API不可用而丢失
   */
  fetchReviews: async () => {
    if (get().isLoading) return
    set({ isLoading: true, syncError: null })

    // 1. 先读取本地缓存（即使没有网络也能立即展示）
    const local = loadLocal()
    if (local) {
      set({ reviews: local, initialized: true })
    }

    // 2. 后台从 API 同步（不阻塞 UI，失败不影响本地数据）
    try {
      const response = await fetch(API_BASE)
      if (!response.ok) throw new Error("加载失败 (" + response.status + ")")
      const data = await response.json()
      if (data.success) {
        const reviews = (data.reviews || []).map(r => ({
          id: r.id,
          topic: r.topic,
          teacherId: r.teacherId || "",
          teacherName: r.teacherName,
          grade: r.grade,
          classType: r.classType,
          type: r.type,
          subject: r.subject || "数学",
          totalScore: r.totalScore,
          dimensions: r.dimensions || [],
          overallComment: r.overallComment || "",
          suggestions: r.suggestions || [],
          highlights: r.highlights || [],
          createdAt: r.createdAt,
          status: "completed",
        }))
        saveLocal(reviews)
        set({ reviews, isSynced: true })
      } else {
        throw new Error(data.error || "加载失败")
      }
    } catch (err) {
      console.warn("从API加载评课记录失败（使用本地缓存）:", err.message)
      set({ syncError: err.message, isSynced: false })
    } finally {
      set({ isLoading: false })
    }
  },

  /**
   * 新增评课记录 → 先存本地，再尝试同步到 API
   */
  addReview: async (review) => {
    const localId = "R" + Date.now()
    const newReview = {
      ...review,
      id: localId,
      createdAt: new Date().toISOString(),
      status: "completed",
    }
    const reviews = [newReview, ...get().reviews]
    saveLocal(reviews)
    set({ reviews })

    // 后台同步到 API（不阻塞）
    try {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: review.topic,
          teacherId: review.teacherId || "",
          teacherName: review.teacherName,
          grade: review.grade,
          classType: review.classType,
          type: review.type,
          subject: review.subject || "数学",
          reviewerName: review.reviewerName,
          totalScore: review.totalScore,
          passScore: review.passScore || 85,
          dimensions: review.dimensions,
          overallComment: review.overallComment,
          suggestions: review.suggestions,
          highlights: review.highlights,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.review) {
          newReview.id = data.review.id
          const updated = [newReview, ...get().reviews.filter(r => r.id !== localId)]
          saveLocal(updated)
          set({ reviews: updated, isSynced: true })
        }
      } else {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || "写入API失败")
      }
    } catch (err) {
      console.warn("写入API失败，数据已保存到本地:", err.message)
    }

    return newReview
  },

  deleteReview: async (id) => {
    try {
      await fetch(`/api/reviews?id=${id}`, { method: "DELETE" })
    } catch (e) {
      console.error("删除API记录失败:", e)
    }
    const reviews = get().reviews.filter(r => r.id !== id)
    saveLocal(reviews)
    set({ reviews })
  },

  getById: (id) => get().reviews.find(r => r.id === id),
  getByTeacher: (teacherId) => get().reviews.filter(r => r.teacherId === teacherId),
  getByGrade: (grade) => get().reviews.filter(r => r.grade === grade),
  getRecent: (limit = 10) => get().reviews.slice(0, limit),

  /**
   * 统计数据 - 适配四级评级体系
   * 优秀 >=90 / 良好 75-89 / 合格 60-74 / 待改进 <60
   */
  getStats: () => {
    const reviews = get().reviews
    const total = reviews.length

    const excellent = reviews.filter(r => r.totalScore >= 90).length
    const good = reviews.filter(r => r.totalScore >= 75 && r.totalScore < 90).length
    const pass = reviews.filter(r => r.totalScore >= 60 && r.totalScore < 75).length
    const needImprove = reviews.filter(r => r.totalScore < 60).length

    const avgScore = total > 0
      ? (reviews.reduce((sum, r) => sum + r.totalScore, 0) / total).toFixed(1)
      : 0

    const excellentRate = total > 0 ? ((excellent / total) * 100).toFixed(1) : 0

    const byType = {
      lesson_plan: reviews.filter(r => r.type === "lesson_plan").length,
      lesson_polish: reviews.filter(r => r.type === "lesson_polish").length,
      class_recording: reviews.filter(r => r.type === "class_recording").length,
    }
    const byGrade = {}
    for (const r of reviews) {
      if (!byGrade[r.grade]) byGrade[r.grade] = { total: 0, avg: 0, excellent: 0, good: 0, pass: 0, needImprove: 0 }
      byGrade[r.grade].total++
      byGrade[r.grade].avg += r.totalScore
      if (r.totalScore >= 90) byGrade[r.grade].excellent++
      else if (r.totalScore >= 75) byGrade[r.grade].good++
      else if (r.totalScore >= 60) byGrade[r.grade].pass++
      else byGrade[r.grade].needImprove++
    }
    for (const g in byGrade) {
      byGrade[g].avg = (byGrade[g].avg / byGrade[g].total).toFixed(1)
    }

    // 教师排名（按平均分降序，至少1次评课）
    const teacherMap = {}
    for (const r of reviews) {
      const key = r.teacherId || r.teacherName
      if (!teacherMap[key]) {
        teacherMap[key] = {
          teacherId: r.teacherId || "",
          teacherName: r.teacherName,
          grade: r.grade,
          total: 0,
          sum: 0,
          max: 0,
        }
      }
      teacherMap[key].total++
      teacherMap[key].sum += r.totalScore
      if (r.totalScore > teacherMap[key].max) teacherMap[key].max = r.totalScore
    }
    const teacherRanking = Object.values(teacherMap)
      .map(t => ({ ...t, avg: (t.sum / t.total).toFixed(1) }))
      .sort((a, b) => b.avg - a.avg)

    return {
      total,
      excellent,
      good,
      pass,
      needImprove,
      excellentRate,
      avgScore,
      byType,
      byGrade,
      teacherRanking,
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
}))

export default useReviewStore
