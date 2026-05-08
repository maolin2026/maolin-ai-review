import { useState, useMemo } from "react"
import useTeacherStore from "../stores/teacherStore"
import { GRADES } from "../data/initialTeachers"
import { Users, Plus, Edit2, Trash2, Search, X, Shield, Eye, EyeOff, Key, UserCheck, BookOpen, RefreshCw } from "lucide-react"

const ROLE_LABELS = {
  admin: { label: "管理员", color: "text-red-700", bg: "bg-red-100", icon: Shield },
  teacher: { label: "教师", color: "text-blue-700", bg: "bg-blue-100", icon: Users },
}

export default function TeachersPage() {
  const teachers = useTeacherStore(s => s.teachers)
  const addTeacher = useTeacherStore(s => s.addTeacher)
  const updateTeacher = useTeacherStore(s => s.updateTeacher)
  const deleteTeacher = useTeacherStore(s => s.deleteTeacher)
  const loading = useTeacherStore(s => s.loading)

  const [search, setSearch] = useState("")
  const [filterGrade, setFilterGrade] = useState("")
  const [filterRole, setFilterRole] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [form, setForm] = useState({ name: "", id: "", grade: "三年级", role: "teacher", group: "", password: "maolin2026" })
  const [showPasswords, setShowPasswords] = useState({})

  const filtered = useMemo(() => teachers.filter(t => {
    if (search && !t.name.includes(search) && !t.id.includes(search)) return false
    if (filterGrade && t.grade !== filterGrade) return false
    if (filterRole && t.role !== filterRole) return false
    return true
  }), [teachers, search, filterGrade, filterRole])

  // 统计数据
  const stats = useMemo(() => {
    const total = teachers.filter(t => t.role !== "admin").length
    const byGrade = GRADES.reduce((acc, g) => {
      acc[g] = teachers.filter(t => t.grade === g && t.role !== "admin").length
      return acc
    }, {})
    const groupLeaders = teachers.filter(t => t.group === "组长").length
    return { total, byGrade, groupLeaders }
  }, [teachers])

  const togglePassword = (id) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleResetPassword = (teacher) => {
    if (confirm(`确定要将 ${teacher.name} 的密码重置为默认密码 "maolin2026" 吗？`)) {
      updateTeacher(teacher.id, { password: "maolin2026" })
    }
  }

  const handleAdd = () => {
    setEditingTeacher(null)
    setForm({ name: "", id: "", grade: "三年级", role: "teacher", group: "", password: "maolin2026" })
    setShowModal(true)
  }

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher)
    setForm({
      name: teacher.name,
      id: teacher.id,
      grade: teacher.grade,
      role: teacher.role || "teacher",
      group: teacher.group || "",
      password: teacher.password || "maolin2026",
    })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    if (editingTeacher) {
      updateTeacher(editingTeacher.id, {
        name: form.name.trim(),
        grade: form.grade,
        role: form.role,
        group: form.group,
        password: form.password,
      })
    } else {
      addTeacher({
        id: form.id.trim() || `ML${Date.now()}`,
        name: form.name.trim(),
        grade: form.grade,
        role: form.role,
        group: form.group,
        password: form.password,
      })
    }
    setShowModal(false)
  }

  const handleDelete = (teacher) => {
    if (confirm(`确定要删除教师 ${teacher.name} 吗？此操作不可撤销。`)) {
      deleteTeacher(teacher.id)
    }
  }

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Users className="w-7 h-7" /> 账号管理
          </h1>
          <p className="text-sm text-gray-500 mt-1">管理教师账号、角色和权限</p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-1">
          <Plus className="w-4 h-4" /> 添加教师
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="card text-center py-4">
          <p className="text-2xl font-bold text-primary-600">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">教师总数</p>
        </div>
        {GRADES.slice(0, 4).map(g => (
          <div key={g} className="card text-center py-4">
            <p className="text-2xl font-bold text-gray-700">{stats.byGrade[g]}</p>
            <p className="text-xs text-gray-500 mt-1">{g}</p>
          </div>
        ))}
      </div>

      {/* 搜索筛选 */}
      <div className="card">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9"
              placeholder="搜索姓名或工号..."
            />
          </div>
          <select
            value={filterGrade}
            onChange={e => setFilterGrade(e.target.value)}
            className="input-field w-auto"
          >
            <option value="">全部年级</option>
            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="input-field w-auto"
          >
            <option value="">全部角色</option>
            <option value="admin">管理员</option>
            <option value="teacher">教师</option>
          </select>
        </div>
      </div>

      {/* 教师列表 */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="section-title mb-0">教师列表</h3>
          <span className="text-sm text-gray-400">共 {filtered.length} 人</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2.5 px-3 text-gray-500 font-medium">工号</th>
                <th className="text-left py-2.5 px-3 text-gray-500 font-medium">姓名</th>
                <th className="text-left py-2.5 px-3 text-gray-500 font-medium">年级</th>
                <th className="text-left py-2.5 px-3 text-gray-500 font-medium">职务</th>
                <th className="text-left py-2.5 px-3 text-gray-500 font-medium">角色</th>
                <th className="text-left py-2.5 px-3 text-gray-500 font-medium">密码</th>
                <th className="text-right py-2.5 px-3 text-gray-500 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => {
                const roleInfo = ROLE_LABELS[t.role] || ROLE_LABELS.teacher
                const RoleIcon = roleInfo.icon
                return (
                  <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-3 text-gray-400 font-mono text-xs">{t.id}</td>
                    <td className="py-2.5 px-3 font-medium text-gray-900">{t.name}</td>
                    <td className="py-2.5 px-3 text-gray-600">{t.grade}</td>
                    <td className="py-2.5 px-3">
                      {t.group === "组长" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          <BookOpen className="w-3 h-3" /> 组长
                        </span>
                      ) : t.role === "admin" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs font-medium">
                          <Shield className="w-3 h-3" /> 主管
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">教师</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 ${roleInfo.bg} ${roleInfo.color} rounded text-xs font-medium`}>
                        <RoleIcon className="w-3 h-3" /> {roleInfo.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-xs text-gray-500">
                          {showPasswords[t.id]
                            ? (t.password || "maolin2026")
                            : "••••••••"
                          }
                        </span>
                        <button
                          onClick={() => togglePassword(t.id)}
                          className="text-gray-400 hover:text-gray-600 p-0.5"
                          title={showPasswords[t.id] ? "隐藏密码" : "显示密码"}
                        >
                          {showPasswords[t.id]
                            ? <EyeOff className="w-3.5 h-3.5" />
                            : <Eye className="w-3.5 h-3.5" />
                          }
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleResetPassword(t)}
                          className="text-amber-600 hover:text-amber-700 p-1"
                          title="重置密码"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(t)}
                          className="text-primary-600 hover:text-primary-700 p-1"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {t.role !== "admin" && (
                          <button
                            onClick={() => handleDelete(t)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {!filtered.length && !loading && (
          <div className="text-center py-12">
            <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">未找到匹配的教师</p>
          </div>
        )}
      </div>

      {/* 添加/编辑模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingTeacher ? "编辑教师" : "添加教师"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label-text">工号</label>
                {editingTeacher ? (
                  <input
                    type="text"
                    value={form.id}
                    className="input-field bg-gray-100 cursor-not-allowed"
                    readOnly
                  />
                ) : (
                  <input
                    type="text"
                    value={form.id}
                    onChange={e => setForm(f => ({ ...f, id: e.target.value }))}
                    className="input-field font-mono"
                    placeholder="如 ML0406（留空自动生成）"
                  />
                )}
              </div>
              <div>
                <label className="label-text">姓名</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="input-field"
                  placeholder="教师姓名"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text">年级</label>
                  <select
                    value={form.grade}
                    onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
                    className="input-field"
                  >
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-text">职务</label>
                  <select
                    value={form.group}
                    onChange={e => setForm(f => ({ ...f, group: e.target.value }))}
                    className="input-field"
                  >
                    <option value="">普通教师</option>
                    <option value="组长">组长</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label-text">角色</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className="input-field"
                >
                  <option value="teacher">教师（可提交评课、查看自己的记录）</option>
                  <option value="admin">管理员（可查看所有数据、管理教师）</option>
                </select>
              </div>
              <div>
                <label className="label-text">密码</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="input-field flex-1 font-mono"
                    placeholder="登录密码"
                  />
                  {!editingTeacher && (
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, password: "maolin2026" }))}
                      className="btn-secondary text-xs flex items-center gap-1 px-2"
                      title="恢复默认密码"
                    >
                      <RefreshCw className="w-3 h-3" /> 默认
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                取消
              </button>
              <button onClick={handleSave} className="btn-primary flex-1" disabled={!form.name.trim()}>
                {editingTeacher ? "保存修改" : "添加"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
