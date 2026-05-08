import { useState } from "react"
import { useNavigate } from "react-router-dom"
import useAuthStore from "../stores/authStore"
import { BookOpen, Users, GraduationCap } from "lucide-react"

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)
  const [role, setRole] = useState("teacher") // "teacher" | "admin"
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !password.trim()) {
      setError("请输入姓名和密码")
      return
    }
    setLoading(true)
    setError("")
    await new Promise(r => setTimeout(r, 300))
    const result = login(name.trim(), password.trim())
    if (result.success) {
      navigate("/")
    } else {
      setError(result.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 px-4">
      <div className="w-full max-w-md">
        {/* 品牌区域 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur rounded-2xl mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">AI磨课评课系统</h1>
          <p className="text-primary-200 mt-2">茂林教育 · 小学数学项目组</p>
        </div>

        {/* 数据亮点 */}
        <div className="flex justify-center gap-8 mb-8">
          {[
            { num: "5", label: "评分维度" },
            { num: "21", label: "评分子项" },
            { num: "AI", label: "智能评课" },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-bold text-white">{item.num}</p>
              <p className="text-xs text-primary-300">{item.label}</p>
            </div>
          ))}
        </div>

        {/* 登录卡片 */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* 角色切换 */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => { setRole("teacher"); setError("") }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                role === "teacher"
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              教师登录
            </button>
            <button
              type="button"
              onClick={() => { setRole("admin"); setError("") }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                role === "admin"
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Users className="w-4 h-4" />
              教学主管登录
            </button>
          </div>

          {/* 角色说明 */}
          <p className="text-xs text-gray-400 text-center mb-5">
            {role === "teacher" ? "教师账号由机构统一分配" : "教学主管账号由机构统一分配"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input-field"
                placeholder="请输入您的姓名"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field"
                placeholder="请输入密码"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary-600 text-white font-medium shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "登录中..." : "登 录"}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            账号由机构统一分配，如需申请请联系管理员
          </p>
        </div>

        <p className="text-center text-primary-300 text-xs mt-6">
          茂林教育（湖南常德）教学中心
        </p>
      </div>
    </div>
  )
}
