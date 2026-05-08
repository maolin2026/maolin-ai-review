import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import useAuthStore from "../stores/authStore"
import useReviewStore from "../stores/reviewStore"
import useTeacherStore from "../stores/teacherStore"
import {
  BarChart3, Users, ClipboardCheck, TrendingUp, Award,
  ArrowRight, Download, Search, Filter, Eye, Trash2, Calendar, Trophy, Target
} from "lucide-react"
import { REVIEW_TYPES, getRating, RATING_LEVELS } from "../data/reviewStandards"

export default function DashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const isAdmin = useAuthStore(s => s.isAdmin)
  const reviews = useReviewStore(s => s.reviews)
  const deleteReview = useReviewStore(s => s.deleteReview)
  const allTeachers = useTeacherStore(s => s.teachers)

  const [searchName, setSearchName] = useState("")
  const [filterGrade, setFilterGrade] = useState("")
  const [filterType, setFilterType] = useState("")
  const [filterLevel, setFilterLevel] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showDetail, setShowDetail] = useState(null)
  const pageSize = 10

  // 统计数据
  const stats = useMemo(() => {
    const total = reviews.length
    const avgScore = total > 0 ? (reviews.reduce((s, r) => s + r.totalScore, 0) / total).toFixed(0) : 0
    const excellentCount = reviews.filter(r => r.totalScore >= 90).length
    const excellentRate = total > 0 ? Math.round((excellentCount / total) * 100) : 0
    const latestDate = reviews.length > 0 ? new Date(reviews[0].createdAt).toLocaleDateString("zh-CN") : "-"
    return { total, avgScore, excellentRate, latestDate }
  }, [reviews])

  // 教师排名
  const teacherRanking = useMemo(() => {
    const map = {}
    for (const r of reviews) {
      if (!r.teacherName) continue
      if (!map[r.teacherName]) map[r.teacherName] = { name: r.teacherName, total: 0, scoreSum: 0 }
      map[r.teacherName].total++
      map[r.teacherName].scoreSum += r.totalScore
    }
    return Object.values(map)
      .map(t => ({ ...t, avg: Math.round(t.scoreSum / t.total) }))
      .sort((a, b) => b.avg - a.avg || b.total - a.total)
      .slice(0, 10)
  }, [reviews])

  // 筛选
  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      if (searchName && !r.teacherName?.includes(searchName)) return false
      if (filterGrade && r.grade !== filterGrade) return false
      if (filterType && r.type !== filterType) return false
      const rating = getRating(r.totalScore)
      if (filterLevel && rating.key !== filterLevel) return false
      return true
    })
  }, [reviews, searchName, filterGrade, filterType, filterLevel])

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / pageSize))
  const paginatedReviews = filteredReviews.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // 导出全部为CSV
  const handleExportAll = () => {
    const headers = ["序号", "教师姓名", "学段", "课题名称", "年级", "评课类型", "总分", "评级", "评课日期"]
    const rows = filteredReviews.map((r, i) => [
      i + 1,
      r.teacherName || "",
      "小学数学",
      r.topic || "",
      r.grade || "",
      REVIEW_TYPES[r.type] || r.type || "",
      r.totalScore,
      getRating(r.totalScore).label,
      r.createdAt ? new Date(r.createdAt).toLocaleDateString("zh-CN") : ""
    ])
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const BOM = "\uFEFF"
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `评课记录_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDelete = async (review) => {
    if (confirm(`确定要删除 ${review.teacherName} 的评课记录吗？`)) {
      await deleteReview(review.id)
    }
  }

  const grades = useMemo(() => {
    const s = new Set(reviews.map(r => r.grade).filter(Boolean))
    return [...s].sort()
  }, [reviews])

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <ClipboardCheck className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">评课总次数</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">平均总分</p>
            <p className="text-2xl font-bold text-gray-900">{stats.avgScore}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-amber-100 rounded-lg">
            <Award className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">优秀率</p>
            <p className="text-2xl font-bold text-gray-900">{stats.excellentRate}%</p>
            <p className="text-xs text-gray-400">90分以上</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">最近评课</p>
            <p className="text-lg font-bold text-gray-900">{stats.latestDate}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 评课记录列表 */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">评课记录列表</h3>
            <button onClick={handleExportAll} className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 font-medium">
              <Download className="w-4 h-4" /> 导出全部
            </button>
          </div>

          {/* 筛选栏 */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="relative flex-1 min-w-[140px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchName}
                onChange={e => { setSearchName(e.target.value); setCurrentPage(1) }}
                className="input-field pl-8 text-sm"
                placeholder="搜索教师姓名"
              />
            </div>
            <select value={filterGrade} onChange={e => { setFilterGrade(e.target.value); setCurrentPage(1) }} className="input-field w-auto text-sm">
              <option value="">全部年级</option>
              {grades.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <select value={filterType} onChange={e => { setFilterType(e.target.value); setCurrentPage(1) }} className="input-field w-auto text-sm">
              <option value="">全部类型</option>
              {Object.entries(REVIEW_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={filterLevel} onChange={e => { setFilterLevel(e.target.value); setCurrentPage(1) }} className="input-field w-auto text-sm">
              <option value="">全部评级</option>
              {RATING_LEVELS.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
          </div>

          {/* 表格 */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2.5 px-2 text-gray-500 font-medium">教师姓名</th>
                  <th className="text-left py-2.5 px-2 text-gray-500 font-medium">课题名称</th>
                  <th className="text-left py-2.5 px-2 text-gray-500 font-medium">年级</th>
                  <th className="text-left py-2.5 px-2 text-gray-500 font-medium">类型</th>
                  <th className="text-center py-2.5 px-2 text-gray-500 font-medium">总分</th>
                  <th className="text-center py-2.5 px-2 text-gray-500 font-medium">评级</th>
                  <th className="text-left py-2.5 px-2 text-gray-500 font-medium">日期</th>
                  <th className="text-center py-2.5 px-2 text-gray-500 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReviews.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-8 text-gray-400">暂无评课记录</td></tr>
                ) : (
                  paginatedReviews.map(r => {
                    const rating = getRating(r.totalScore)
                    return (
                      <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-2 px-2 font-medium">{r.teacherName}</td>
                        <td className="py-2 px-2 text-gray-600 max-w-[140px] truncate">{r.topic || "-"}</td>
                        <td className="py-2 px-2 text-gray-600">{r.grade || "-"}</td>
                        <td className="py-2 px-2">
                          <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{REVIEW_TYPES[r.type] || r.type || "-"}</span>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span className="text-lg font-bold" style={{ color: rating.color }}>{r.totalScore}</span>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full border"
                            style={{ color: rating.color, backgroundColor: rating.bgColor, borderColor: rating.borderColor }}
                          >
                            {rating.label}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-gray-500 text-xs">{r.createdAt ? new Date(r.createdAt).toLocaleDateString("zh-CN") : "-"}</td>
                        <td className="py-2 px-2 text-center">
                          <button onClick={() => setShowDetail(r)} className="text-primary-600 hover:text-primary-700 p-1" title="查看">
                            <Eye className="w-4 h-4 inline" />
                          </button>
                          {isAdmin && (
                            <button onClick={() => handleDelete(r)} className="text-red-400 hover:text-red-600 p-1 ml-1" title="删除">
                              <Trash2 className="w-4 h-4 inline" />
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-500">第 {currentPage} / {totalPages} 页</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary text-sm py-1 px-3 disabled:opacity-40"
                >上一页</button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-secondary text-sm py-1 px-3 disabled:opacity-40"
                >下一页</button>
              </div>
            </div>
          )}
        </div>

        {/* 教师排名 */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" /> 教师排名
          </h3>
          {teacherRanking.length === 0 ? (
            <p className="text-gray-400 text-center py-8">暂无数据</p>
          ) : (
            <div className="space-y-3">
              {teacherRanking.map((t, i) => {
                const rankColors = ["bg-amber-400 text-white", "bg-gray-400 text-white", "bg-orange-400 text-white", "bg-gray-200 text-gray-600"]
                const rankClass = i < 3 ? rankColors[i] : rankColors[3]
                return (
                  <div key={t.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${rankClass}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.total} 次评课</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold" style={{ color: getRating(t.avg).color }}>{t.avg}</p>
                      <p className="text-xs text-gray-400">平均分</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 评课详情弹窗 */}
      {showDetail && (
        <ReviewDetailModal review={showDetail} onClose={() => setShowDetail(null)} />
      )}
    </div>
  )
}

// ==================== 评课详情弹窗（含雷达图） ====================
function ReviewDetailModal({ review, onClose }) {
  const rating = getRating(review.totalScore)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* 头部 */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">评课详情</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div className="p-5 space-y-5">
          {/* 教师信息 */}
          <div className="rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-semibold text-gray-500 mb-3">教师信息</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div><p className="text-xs text-gray-400">教师姓名</p><p className="text-sm font-medium">{review.teacherName || "-"}</p></div>
              <div><p className="text-xs text-gray-400">年级</p><p className="text-sm font-medium">{review.grade || "-"}</p></div>
              <div><p className="text-xs text-gray-400">课题名称</p><p className="text-sm font-medium">{review.topic || "-"}</p></div>
              <div><p className="text-xs text-gray-400">评课类型</p><p className="text-sm font-medium">{REVIEW_TYPES[review.type] || review.type || "-"}</p></div>
              <div><p className="text-xs text-gray-400">评课日期</p><p className="text-sm font-medium">{review.createdAt ? new Date(review.createdAt).toLocaleDateString("zh-CN") : "-"}</p></div>
            </div>
          </div>

          {/* 评分结果 */}
          <div className="rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-semibold text-gray-500 mb-3">评分结果</h4>

            {/* 维度分数 */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {(review.dimensions || []).map(dim => (
                <div key={dim.dimensionId || dim.name} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-700">{dim.name}</span>
                  <span className="text-sm font-bold" style={{ color: dim.score >= dim.maxScore * 0.9 ? "#22c55e" : dim.score >= dim.maxScore * 0.7 ? "#f59e0b" : "#ef4444" }}>
                    {dim.score}/{dim.maxScore}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-sm font-bold text-gray-700">总分</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold" style={{ color: rating.color }}>{review.totalScore}</span>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full border"
                    style={{ color: rating.color, backgroundColor: rating.bgColor, borderColor: rating.borderColor }}
                  >{rating.label}</span>
                </div>
              </div>
            </div>

            {/* 雷达图 */}
            {review.dimensions && review.dimensions.length >= 3 && (
              <RadarChart dimensions={review.dimensions} />
            )}
          </div>

          {/* 亮点 */}
          {review.highlights && review.highlights.length > 0 && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h4 className="text-sm font-semibold text-green-700 mb-2">本节课亮点</h4>
              <ul className="space-y-2">
                {review.highlights.map((h, i) => (
                  <li key={i} className="text-sm text-green-800">{h}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 改进建议 */}
          {review.suggestions && review.suggestions.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h4 className="text-sm font-semibold text-amber-700 mb-2">改进建议</h4>
              <ul className="space-y-2">
                {review.suggestions.map((s, i) => (
                  <li key={i} className="text-sm text-amber-800">{s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 总体评语 */}
          {review.overallComment && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 className="text-sm font-semibold text-blue-700 mb-2">总体评语</h4>
              <p className="text-sm text-blue-800 whitespace-pre-wrap">{review.overallComment}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ==================== 简易雷达图（纯SVG，无需额外依赖） ====================
function RadarChart({ dimensions }) {
  const dims = dimensions.filter(d => d.maxScore > 0)
  if (dims.length < 3) return null

  const n = dims.length
  const size = 200
  const center = size / 2
  const maxR = size / 2 - 30

  // 计算每个维度的百分比
  const percents = dims.map(d => Math.max(0, Math.min(1, d.score / d.maxScore)))

  // 计算角度（从顶部开始，顺时针）
  const angles = dims.map((_, i) => (2 * Math.PI * i / n) - Math.PI / 2)

  // 计算多边形顶点
  function getPoints(factor) {
    return angles.map((angle, i) => ({
      x: center + factor * maxR * percents[i] * Math.cos(angle),
      y: center + factor * maxR * percents[i] * Math.sin(angle),
    }))
  }

  // 背景网格（3层）
  const gridLevels = [0.33, 0.66, 1.0]

  // 数据多边形
  const dataPoints = getPoints(1)
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z"

  // 标签位置
  const labelPoints = angles.map((angle, i) => ({
    x: center + (maxR + 22) * Math.cos(angle),
    y: center + (maxR + 22) * Math.sin(angle),
  }))

  return (
    <div className="flex justify-center mt-4">
      <svg width={size} height={size + 10} viewBox={`0 0 ${size} ${size}`}>
        {/* 背景网格 */}
        {gridLevels.map(level => {
          const points = angles.map(angle => ({
            x: center + level * maxR * Math.cos(angle),
            y: center + level * maxR * Math.sin(angle),
          }))
          const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z"
          return <path key={level} d={path} fill="none" stroke="#e5e7eb" strokeWidth="1" />
        })}

        {/* 轴线 */}
        {angles.map((angle, i) => (
          <line key={i} x1={center} y1={center}
            x2={center + maxR * Math.cos(angle)}
            y2={center + maxR * Math.sin(angle)}
            stroke="#e5e7eb" strokeWidth="1" />
        ))}

        {/* 数据区域 */}
        <path d={dataPath} fill="rgba(59, 130, 246, 0.15)" stroke="#3b82f6" strokeWidth="2" />

        {/* 数据点 */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#3b82f6" />
        ))}

        {/* 标签 */}
        {dims.map((dim, i) => {
          const anchor = labelPoints[i].x < center ? "end" : labelPoints[i].x > center ? "start" : "middle"
          return (
            <text key={i}
              x={labelPoints[i].x}
              y={labelPoints[i].y + 4}
              textAnchor={anchor}
              fontSize="10"
              fill="#4b5563"
              fontWeight="500"
            >
              {dim.name}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
