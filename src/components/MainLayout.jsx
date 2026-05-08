import { useState, useEffect } from "react"
import { Outlet, NavLink, useNavigate } from "react-router-dom"
import useAuthStore from "../stores/authStore"
import useReviewStore from "../stores/reviewStore"
import useTeacherStore from "../stores/teacherStore"
import {
  BarChart3, ClipboardCheck, Users, Settings,
  LogOut, BookOpen, Menu, X, History
} from "lucide-react"

const navItems = [
  { to: "/", icon: BarChart3, label: "管理后台", adminOnly: true },
  { to: "/review/new", icon: ClipboardCheck, label: "新建评课", adminOnly: false },
  { to: "/review/history", icon: History, label: "评课记录", adminOnly: false },
  { to: "/teachers", icon: Users, label: "教师管理", adminOnly: true },
  { to: "/settings", icon: Settings, label: "系统设置", adminOnly: true },
]

export default function MainLayout() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)
  const isAdmin = useAuthStore(s => s.isAdmin)
  const fetchReviews = useReviewStore(s => s.fetchReviews)
  const isSynced = useReviewStore(s => s.isSynced)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const fetchTeachers = useTeacherStore(s => s.fetchTeachers)
  useEffect(() => {
    fetchReviews()
    fetchTeachers()
  }, [fetchReviews, fetchTeachers])

  // 教师登录时默认跳转到评课记录
  useEffect(() => {
    if (!isAdmin) {
      const path = window.location.pathname
      if (path === "/" || path === "/teachers" || path === "/settings") {
        navigate("/review/history", { replace: true })
      }
    }
  }, [isAdmin, navigate])

  const handleLogout = () => {
    if (confirm("确定要退出登录吗？")) {
      logout()
      navigate("/login")
    }
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-primary-50 text-primary-700"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 移动端头部 */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary-600" />
          <span className="font-semibold text-gray-900">AI磨课评课</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* 侧边栏遮罩 */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-primary-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-primary-600" />
            </div>
            <span className="font-bold text-gray-900">AI磨课评课</span>
          </div>
          <p className="text-xs text-gray-400 ml-9">茂林教育</p>
        </div>

        <nav className="px-3 space-y-1">
          {filteredNav(navItems, isAdmin).map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={linkClass}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-sm">
              {user?.name?.charAt(0) || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400">
                {isAdmin ? "教学主管" : `${user?.grade || "教师"}`}
              </p>
            </div>
            {!isSynced && (
              <span className="w-2 h-2 rounded-full bg-yellow-400" title="数据未同步" />
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function filteredNav(items, isAdmin) {
  return items.filter(item => {
    // 管理后台只对管理员可见
    if (item.to === "/" && !isAdmin) return false
    // 教师管理和系统设置只对管理员可见
    if (item.adminOnly && !isAdmin) return false
    return true
  })
}
