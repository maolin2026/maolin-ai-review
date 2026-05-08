import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import useReviewStore from "../stores/reviewStore"
import useAuthStore from "../stores/authStore"
import {
  ClipboardCheck, Search, Calendar, Eye, ArrowRight
} from "lucide-react"
import { REVIEW_TYPES, getRating } from "../data/reviewStandards"

export default function ReviewHistoryPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const isAdmin = useAuthStore(s => s.isAdmin)
  const reviews = useReviewStore(s => s.reviews)
  const [search, setSearch] = useState("")
  const [showDetail, setShowDetail] = useState(null)

  // 教师视角：只看自己的；主管视角：看所有人的
  const filtered = useMemo(() => {
    let list = isAdmin ? reviews : reviews.filter(r => r.teacherName === user?.name)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(r =>
        (r.teacherName || "").toLowerCase().includes(q) ||
        (r.topic || "").toLowerCase().includes(q) ||
        (r.grade || "").toLowerCase().includes(q)
      )
    }
    return list
  }, [reviews, search, isAdmin, user])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">评课历史记录</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">共 {filtered.length} 条记录</span>
          <button
            onClick={() => navigate("/review/new")}
            className="btn-primary text-sm flex items-center gap-1"
          >
            <ClipboardCheck className="w-4 h-4" /> 提交评课
          </button>
        </div>
      </div>

      {/* 搜索 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-9"
          placeholder="按课程名称或教师姓名搜索..."
        />
      </div>

      {/* 卡片列表 */}
      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">暂无评课记录</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const rating = getRating(r.totalScore)
            return (
              <button
                key={r.id}
                onClick={() => setShowDetail(r)}
                className="w-full card hover:shadow-md transition-shadow text-left flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{r.topic || "-"}</span>
                    <span className="text-sm text-gray-400">{r.teacherName}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-sm text-gray-400">{r.grade}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{REVIEW_TYPES[r.type] || r.type || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{r.createdAt ? new Date(r.createdAt).toLocaleDateString("zh-CN") : "-"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <span className="text-lg font-bold" style={{ color: rating.color }}>{r.totalScore}分</span>
                    <span
                      className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full border"
                      style={{ color: rating.color, backgroundColor: rating.bgColor, borderColor: rating.borderColor }}
                    >{rating.label}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300" />
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* 详情弹窗 */}
      {showDetail && (
        <ReviewDetailModal review={showDetail} onClose={() => setShowDetail(null)} />
      )}
    </div>
  )
}

// ==================== 评课详情弹窗 ====================
function ReviewDetailModal({ review, onClose }) {
  const rating = getRating(review.totalScore)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
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
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full border"
                    style={{ color: rating.color, backgroundColor: rating.bgColor, borderColor: rating.borderColor }}>{rating.label}</span>
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
                {review.highlights.map((h, i) => <li key={i} className="text-sm text-green-800">{h}</li>)}
              </ul>
            </div>
          )}

          {/* 改进建议 */}
          {review.suggestions && review.suggestions.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h4 className="text-sm font-semibold text-amber-700 mb-2">改进建议</h4>
              <ul className="space-y-2">
                {review.suggestions.map((s, i) => <li key={i} className="text-sm text-amber-800">{s}</li>)}
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

// ==================== 雷达图 ====================
function RadarChart({ dimensions }) {
  const dims = dimensions.filter(d => d.maxScore > 0)
  if (dims.length < 3) return null

  const n = dims.length
  const size = 200
  const center = size / 2
  const maxR = size / 2 - 30
  const percents = dims.map(d => Math.max(0, Math.min(1, d.score / d.maxScore)))
  const angles = dims.map((_, i) => (2 * Math.PI * i / n) - Math.PI / 2)
  const gridLevels = [0.33, 0.66, 1.0]

  const dataPoints = angles.map((angle, i) => ({
    x: center + maxR * percents[i] * Math.cos(angle),
    y: center + maxR * percents[i] * Math.sin(angle),
  }))
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z"

  const labelPoints = angles.map((angle) => ({
    x: center + (maxR + 22) * Math.cos(angle),
    y: center + (maxR + 22) * Math.sin(angle),
  }))

  return (
    <div className="flex justify-center mt-4">
      <svg width={size} height={size + 10} viewBox={`0 0 ${size} ${size}`}>
        {gridLevels.map(level => {
          const points = angles.map(angle => ({
            x: center + level * maxR * Math.cos(angle),
            y: center + level * maxR * Math.sin(angle),
          }))
          const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z"
          return <path key={level} d={path} fill="none" stroke="#e5e7eb" strokeWidth="1" />
        })}
        {angles.map((angle, i) => (
          <line key={i} x1={center} y1={center}
            x2={center + maxR * Math.cos(angle)} y2={center + maxR * Math.sin(angle)}
            stroke="#e5e7eb" strokeWidth="1" />
        ))}
        <path d={dataPath} fill="rgba(59, 130, 246, 0.15)" stroke="#3b82f6" strokeWidth="2" />
        {dataPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill="#3b82f6" />)}
        {dims.map((dim, i) => {
          const anchor = labelPoints[i].x < center ? "end" : labelPoints[i].x > center ? "start" : "middle"
          return <text key={i} x={labelPoints[i].x} y={labelPoints[i].y + 4} textAnchor={anchor} fontSize="10" fill="#4b5563" fontWeight="500">{dim.name}</text>
        })}
      </svg>
    </div>
  )
}
