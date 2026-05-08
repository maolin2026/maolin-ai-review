import { useState, useEffect, useMemo } from "react"

import { useNavigate } from "react-router-dom"

import useAuthStore from "../stores/authStore"

import useTeacherStore from "../stores/teacherStore"

import useReviewStore from "../stores/reviewStore"

import useSettingsStore from "../stores/settingsStore"

import { callZhipuReview } from "../api/zhipu"

import { REVIEW_TYPES, REVIEW_DIMENSIONS, REVIEW_TYPE_OPTIONS, PASS_SCORE } from "../data/reviewStandards"

import {

  FileText, Hammer, Video, Loader2, AlertCircle, CheckCircle2,

  ArrowLeft, ChevronRight, X, Star, Lightbulb, Database, CloudOff,

  BarChart3, Check, Lightbulb as LightbulbIcon, Upload, FileAudio, Mic

} from "lucide-react"



export default function NewReviewPage() {

  const navigate = useNavigate()

  const user = useAuthStore(s => s.user)

  const isAdmin = useAuthStore(s => s.isAdmin)

  const allTeachers = useTeacherStore(s => s.teachers)

  const addReview = useReviewStore(s => s.addReview)

  const passScore = useSettingsStore(s => s.settings.passScore) || 85



  const teachers = useMemo(() => allTeachers.filter(t => t.role !== "admin"), [allTeachers])



  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState({

    type: "lesson_plan",

    teacherId: "",

    grade: "",

    classType: "",

    subject: "数学",

    topic: "",

    content: "",

  })

  const [error, setError] = useState("")

  const [result, setResult] = useState(null)

  const [isReviewing, setIsReviewing] = useState(false)

  const [progress, setProgress] = useState("")

  const [cloudStatus, setCloudStatus] = useState(null)

  const [isTranscribing, setIsTranscribing] = useState(false)

  const [transcribeProgress, setTranscribeProgress] = useState(0)

  const [transcribeMsg, setTranscribeMsg] = useState("")

  const [transcribeError, setTranscribeError] = useState("") // null | "saving" | "success" | "error"



  useEffect(() => {

    if (!isAdmin && user?.id && !formData.teacherId) {

      setFormData(prev => ({ ...prev, teacherId: user.id, grade: user.grade }))

    }

  }, [isAdmin, user?.id, formData.teacherId])



  const filteredTeachers = useMemo(

    () => formData.grade ? teachers.filter(t => t.grade === formData.grade) : teachers,

    [teachers, formData.grade]

  )



  const selectedTeacher = teachers.find(t => t.id === formData.teacherId)




  const handleAudioUpload = async (file) => {
    if (!file) return
    if (file.size > 100 * 1024 * 1024) {
      setTranscribeError("音频文件不能超过 100MB")
      return
    }
    setIsTranscribing(true)
    setTranscribeProgress(0)
    setTranscribeMsg("正在上传音频...")
    setTranscribeError("")
    try {
      const formData = new FormData()
      formData.append("audio", file)
      setTranscribeMsg("正在转写语音，请稍候（通常10-20秒）...")
      setTranscribeProgress(30)

      const resp = await fetch("/asr", { method: "POST", body: formData })
      setTranscribeProgress(70)

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}))
        throw new Error(errData.error || `转写请求失败 (HTTP ${resp.status})`)
      }

      const data = await resp.json()
      if (!data.success) {
        throw new Error(data.error || "语音转写失败")
      }

      setTranscribeProgress(100)
      setTranscribeMsg("转写完成")

      const text = data.text || ""
      if (!text.trim()) throw new Error("转写结果为空，请检查音频文件")

      setFormData(prev => ({ ...prev, content: prev.content ? prev.content + "\n\n---\n音频转写补充：\n" + text : text }))
    } catch (err) {
      setTranscribeError(err.message || "语音转写失败")
    } finally {
      setIsTranscribing(false)
    }
  }


  const getTypeLabel = (type) => {

    return REVIEW_TYPES[type] || REVIEW_TYPES[type.toUpperCase()] || type

  }



  const handleNext = () => {

    if (step === 1) {

      if (!formData.type || !formData.teacherId || !formData.grade || !formData.topic || !formData.classType) {

        setError("请填写完整评课信息（含班型）")

        return

      }

      setError("")

      setStep(2)

    }

  }



  const handleStartReview = async () => {

    if (!formData.content.trim()) {

      setError("请输入评课内容")

      return

    }

    if (formData.content.trim().length < 50) {

      setError("评课内容过少，请至少输入50字")

      return

    }



    setError("")

    setStep(3)

    setIsReviewing(true)

    setCloudStatus(null)

    setProgress("正在连接AI评课系统...")



    try {

      setProgress("AI正在分析评课内容，请耐心等待...")

      const reviewResult = await callZhipuReview({

        type: formData.type,

        teacherName: selectedTeacher?.name || "未知",

        grade: formData.grade,

        subject: formData.subject,

        content: formData.content,

      })



      if (reviewResult.success) {

        // Score validation done in zhipu.js

        setCloudStatus("saving")

        const saved = await addReview({

          ...formData,

          teacherName: selectedTeacher?.name,

          reviewerName: user?.name || "系统管理员",

          totalScore: reviewResult.totalScore,

          dimensions: reviewResult.dimensions,

          overallComment: reviewResult.overallComment,

          suggestions: reviewResult.suggestions,

          highlights: reviewResult.highlights,

          passScore: passScore,

        })



        setResult({ ...reviewResult, id: saved.id })

        setStep(4)

        setCloudStatus("success")

      } else {

        setError("AI返回结果格式异常：" + (reviewResult.parseError || "无法解析评分"))

        setStep(2)

      }

    } catch (err) {

      setError("评课失败：" + err.message)

      setStep(2)

    } finally {

      setIsReviewing(false)

      setProgress("")

    }

  }



  const scoreColor = (score) => {

    if (score >= 90) return "text-green-600"

    if (score >= 85) return "text-blue-600"

    if (score >= 60) return "text-yellow-600"

    return "text-red-600"

  }



  const scoreBg = (score) => {

    if (score >= 90) return "bg-green-50 border-green-200"

    if (score >= 85) return "bg-blue-50 border-blue-200"

    if (score >= 60) return "bg-yellow-50 border-red-200"

    return "bg-red-50 border-red-200"

  }



  // 维度颜色配置（8个维度各有不同颜色）

  const DIM_COLORS = [

    { bar: "#1677ff", text: "text-[#1677ff]", bg: "bg-[#1677ff]" },   // 1. 亮蓝

    { bar: "#0091c7", text: "text-[#0091c7]", bg: "bg-[#0091c7]" },   // 2. 深蓝

    { bar: "#00a8a0", text: "text-[#00a8a0]", bg: "bg-[#00a8a0]" },   // 3. 青绿

    { bar: "#06b6d4", text: "text-[#06b6d4]", bg: "bg-[#06b6d4]" },   // 4. 青色

    { bar: "#2858e9", text: "text-[#2858e9]", bg: "bg-[#2858e9]" },   // 5. 蓝紫

    { bar: "#0080ff", text: "text-[#0080ff]", bg: "bg-[#0080ff]" },   // 6. 正蓝

    { bar: "#499ad1", text: "text-[#499ad1]", bg: "bg-[#499ad1]" },   // 7. 浅蓝

    { bar: "#8cb7db", text: "text-[#8cb7db]", bg: "bg-[#8cb7db]" },   // 8. 灰蓝

  ]



  const getDimColor = (index) => DIM_COLORS[index % DIM_COLORS.length]



  // 评价等级判定

  const getScoreLevel = (score, maxScore) => {

    const ratio = maxScore > 0 ? score / maxScore : 0

    if (ratio >= 0.9) return { label: "优秀", color: "text-green-600", bg: "bg-green-50 border border-green-200", dotColor: "bg-green-500" }

    if (ratio >= 0.75) return { label: "合格", color: "text-blue-600", bg: "bg-blue-50 border border-blue-200", dotColor: "bg-blue-500" }

    return { label: "不合格", color: "text-orange-600", bg: "bg-orange-50 border border-orange-200", dotColor: "bg-orange-500" }

  }



  return (

    <div className="max-w-4xl mx-auto space-y-6">

      {/* 步骤指示器 */}

      <div className="flex items-center gap-2 text-sm">

        <button onClick={() => step > 1 && step < 3 && setStep(1)} className="text-gray-400 hover:text-gray-600">

          <ArrowLeft className="w-5 h-5" />

        </button>

        <span className={step >= 1 ? "text-primary-600 font-medium" : "text-gray-400"}>

          1. 评课信息

        </span>

        <ChevronRight className="w-4 h-4 text-gray-300" />

        <span className={step >= 2 ? "text-primary-600 font-medium" : "text-gray-400"}>

          2. 填写内容

        </span>

        <ChevronRight className="w-4 h-4 text-gray-300" />

        <span className={step >= 4 ? "text-primary-600 font-medium" : "text-gray-400"}>

          3. 评课结果

        </span>

      </div>



      {/* 步骤1: 选择评课信息 */}

      {step === 1 && (

        <div className="card space-y-5">

          <h2 className="section-title">评课信息</h2>



          <div>

            <label className="label-text">类型</label>

            <div className="flex gap-3 mt-2">

              {[

                { value: "lesson_plan", label: "评教案", icon: FileText, desc: "评审教师教案设计（茂林磨课标准）" },

                { value: "lesson_polish", label: "评磨课", icon: Hammer, desc: "评审磨课过程（茂林磨课标准）" },

                { value: "class_recording", label: "评实录", icon: Video, desc: "评审课堂实录记录（茂林好课标准）" },

              ].map(t => (

                <button

                  key={t.value}

                  onClick={() => setFormData(f => ({ ...f, type: t.value }))}

                  className={`flex-1 p-4 rounded-xl border-2 text-left transition-all ${

                    formData.type === t.value

                      ? "border-primary-500 bg-primary-50"

                      : "border-gray-200 hover:border-gray-300"

                  }`}

                >

                  <t.icon className={`w-6 h-6 mb-2 ${formData.type === t.value ? "text-primary-600" : "text-gray-400"}`} />

                  <p className={`font-medium ${formData.type === t.value ? "text-primary-700" : "text-gray-700"}`}>{t.label}</p>

                  <p className="text-xs text-gray-500 mt-1">{t.desc}</p>

                </button>

              ))}

            </div>

          </div>



          {isAdmin && (

            <div>

              <label className="label-text">年级</label>

              <select

                value={formData.grade}

                onChange={e => setFormData(f => ({ ...f, grade: e.target.value, teacherId: "" }))}

                className="input-field"

              >

                <option value="">请选择年级</option>

                {["三年级", "四年级", "五年级", "六年级", "七年级", "八年级", "九年级"].map(g => (

                  <option key={g} value={g}>{g}</option>

                ))}

              </select>

            </div>

          )}



          <div>

            <label className="label-text">班型</label>

            <div className="flex gap-3 mt-2">

              {[

                { value: "强", label: "强班", desc: "培优强化的班级" },

                { value: "优", label: "优班", desc: "巩固提升的班级" },

              ].map(t => (

                <button

                  key={t.value}

                  onClick={() => setFormData(f => ({ ...f, classType: t.value }))}

                  className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${

                    formData.classType === t.value

                      ? "border-primary-500 bg-primary-50"

                      : "border-gray-200 hover:border-gray-300"

                  }`}

                >

                  <p className={`font-medium text-lg ${formData.classType === t.value ? "text-primary-700" : "text-gray-700"}`}>{t.label}</p>

                  <p className="text-xs text-gray-500 mt-1">{t.desc}</p>

                </button>

              ))}

            </div>

          </div>



          {isAdmin ? (

            <div>

              <label className="label-text">被评教师</label>

              <select

                value={formData.teacherId}

                onChange={e => setFormData(f => ({ ...f, teacherId: e.target.value }))}

                className="input-field"

              >

                <option value="">请选择教师</option>

                {filteredTeachers.map(t => (

                  <option key={t.id} value={t.id}>

                    {t.name}{t.group ? ` (${t.group})` : ""}

                  </option>

                ))}

              </select>

            </div>

          ) : (

            <div>

              <label className="label-text">被评教师</label>

              <input

                type="text"

                value={user?.name || ""}

                className="input-field bg-gray-50"

                disabled

              />

              <p className="text-xs text-gray-400 mt-1">非管理员默认评自己</p>

            </div>

          )}



          <div>

            <label className="label-text">课题名称</label>

            <input

              type="text"

              value={formData.topic}

              onChange={e => setFormData(f => ({ ...f, topic: e.target.value }))}

              className="input-field"

              placeholder="例如：三角形角度计算"

            />

          </div>



          {error && (

            <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg p-3">

              <AlertCircle className="w-5 h-5 flex-shrink-0" />

              <p className="text-sm">{error}</p>

            </div>

          )}



          <div className="flex justify-end">

            <button onClick={handleNext} className="btn-primary flex items-center gap-2">

              下一步 <ChevronRight className="w-4 h-4" />

            </button>

          </div>

        </div>

      )}



      {/* 步骤2: 填写评课内容 */}

      {step === 2 && (

        <div className="card space-y-4">

          <h2 className="section-title">填写评课内容</h2>



          <div className="flex items-center gap-3 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">

            <span className="font-medium text-gray-700">{selectedTeacher?.name}</span>

            <span>{formData.grade}</span>

            <span className={`px-2 py-0.5 rounded text-xs font-medium ${

              formData.type === "lesson_plan" ? "bg-blue-100 text-blue-700" : formData.type === "lesson_polish" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"

            }`}>

              {getTypeLabel(formData.type)}

            </span>

            <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">

              {formData.classType}班

            </span>

            <span className="text-gray-400">{formData.topic}</span>

          </div>



          <div>

            <label className="label-text">评课内容</label>

            <textarea

              value={formData.content}

              onChange={e => setFormData(f => ({ ...f, content: e.target.value }))}

              className="input-field min-h-[300px] resize-y"

              placeholder="请粘贴或输入教案内容/课堂实录...&#10;&#10;支持以下格式：&#10;- 教案文本（教学目标、教学过程、板书设计等）&#10;- 课堂实录（教学活动记录、师生对话等）&#10;&#10;建议内容不少于50字，内容越详细，评课结果越准确。"

            />

            <p className="text-xs text-gray-400 mt-1">

              已输入 {formData.content.length} 字（建议不少于50字）

            </p>



            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-primary-300 transition-colors">

              <label className="label-text flex items-center gap-2">

                <Mic className="w-4 h-4 text-primary-500" />

                音频转写（可选）

              </label>

              <p className="text-xs text-gray-400 mb-3">上传课堂录音，自动转写为文字并填入评课内容（支持 MP3/WAV，最大 25MB）</p>

              <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg cursor-pointer hover:bg-primary-100 transition-colors text-sm font-medium">

                <Upload className="w-4 h-4" />

                {isTranscribing ? "转写中..." : "上传音频"}

                <input

                  type="file"

                  accept="audio/*"

                  className="hidden"

                  disabled={isTranscribing}

                  onChange={e => { if (e.target.files[0]) handleAudioUpload(e.target.files[0]); e.target.value = "" }}

                />

              </label>

              {isTranscribing && (

                <div className="mt-3 space-y-1">

                  <div className="w-full bg-gray-200 rounded-full h-2">

                    <div className="bg-primary-500 h-2 rounded-full transition-all" style={{ width: transcribeProgress + "%" }} />

                  </div>

                  <p className="text-xs text-gray-500">{transcribeMsg}（{transcribeProgress}%）</p>

                </div>

              )}

              {transcribeError && (

                <p className="text-xs text-red-500 mt-2">{transcribeError}</p>

              )}

            </div>

          </div>



          {error && (

            <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg p-3">

              <AlertCircle className="w-5 h-5 flex-shrink-0" />

              <p className="text-sm">{error}</p>

            </div>

          )}



          <div className="flex justify-between">

            <button onClick={() => setStep(1)} className="btn-secondary flex items-center gap-2">

              <ArrowLeft className="w-4 h-4" /> 上一步

            </button>

            <button

              onClick={handleStartReview}

              disabled={isReviewing || !formData.content.trim()}

              className="btn-primary flex items-center gap-2"

            >

              {isReviewing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}

              {isReviewing ? "评课中..." : "开始AI评课"}

            </button>

          </div>

        </div>

      )}



      {/* 步骤3: AI评课中 */}

      {step === 3 && (

        <div className="card text-center py-16 space-y-4">

          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto" />

          <p className="text-gray-600">{progress}</p>

          <p className="text-sm text-gray-400">AI评课通常需要30-60秒，请耐心等待...</p>

        </div>

      )}



      {/* 步骤4: 评课结果 */}

      {step === 4 && result && (() => {

        const totalMax = result.dimensions?.reduce((sum, d) => sum + (d.maxScore || 0), 0) || 100

        const scoreRate = totalMax > 0 ? ((result.totalScore / totalMax) * 100).toFixed(1) : "0.0"



        return (

        <div className="space-y-4">

          {/* 基础信息栏 */}

          <div className="bg-white rounded-xl p-4 border border-gray-100">

            <div className="flex items-center justify-between flex-wrap gap-2">

              <div className="flex items-center gap-3">

                <span className="font-semibold text-gray-800">{selectedTeacher?.name}</span>

                <span className="text-sm text-gray-400">{formData.grade}</span>

                <span className="text-sm text-gray-400">{formData.topic}</span>

              </div>

              <div className="flex items-center gap-1">

                {result.totalScore >= passScore ? (

                  <><CheckCircle2 className="w-4 h-4 text-green-600" /><span className="text-sm text-green-600 font-medium">达标 {passScore}分</span></>

                ) : (

                  <><X className="w-4 h-4 text-red-500" /><span className="text-sm text-red-500 font-medium">未达标 (需≥{passScore}分)</span></>

                )}

              </div>

            </div>

          </div>



          {/* 评分概览 */}

          <div className="bg-white rounded-xl p-5 border border-gray-100 space-y-4">

            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">

              <BarChart3 className="w-5 h-5 text-[#1677ff]" /> 评分概览

            </h2>

            <div className="flex items-end gap-8">

              <div className="flex items-end gap-1">

                <span className="text-4xl font-bold text-[#1677ff]">{result.totalScore}</span>

                <span className="text-sm text-gray-400 pb-1">/{totalMax} 总分</span>

              </div>

              <div className="flex items-end gap-1">

                <span className="text-2xl font-bold text-[#1677ff]">{scoreRate}%</span>

                <span className="text-sm text-gray-400 pb-0.5">评分率</span>

              </div>

            </div>

            {/* 柱状图 */}

            {result.dimensions && result.dimensions.length > 0 && (

              <div className="pt-2">

                <div className="flex items-end gap-2 h-32">

                  {result.dimensions.map((dim, idx) => {

                    const ratio = dim.maxScore > 0 ? (dim.score / dim.maxScore) * 100 : 0

                    const color = getDimColor(idx)

                    return (

                      <div key={dim.dimensionId} className="flex-1 flex flex-col items-center gap-1">

                        <span className="text-xs font-medium text-gray-500">{Math.round(ratio)}%</span>

                        <div className="w-full bg-gray-100 rounded-t relative" style={{ height: "100px" }}>

                          <div

                            className="absolute bottom-0 left-0 right-0 rounded-t transition-all duration-700"

                            style={{ height: `${ratio}%`, backgroundColor: color.bar }}

                          />

                        </div>

                        <span className="text-xs text-gray-500 truncate w-full text-center" title={dim.name}>

                          {dim.name.length > 4 ? dim.name.substring(0, 4) : dim.name}

                        </span>

                      </div>

                    )

                  })}

                </div>

              </div>

            )}

          </div>



          {/* 各维度评分详情 */}

          {result.dimensions && result.dimensions.length > 0 && (

            <div className="space-y-3">

              {result.dimensions.map((dim, idx) => {

                const ratio = dim.maxScore > 0 ? (dim.score / dim.maxScore) * 100 : 0

                const color = getDimColor(idx)

                const level = getScoreLevel(dim.score, dim.maxScore)

                return (

                  <div key={dim.dimensionId} className="bg-white rounded-xl p-4 border border-gray-100 space-y-3">

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-2">

                        <div className="w-1 h-5 rounded-full" style={{ backgroundColor: color.bar }} />

                        <span className="font-medium text-gray-800 text-sm">{dim.name}</span>

                        <span className="text-xs text-gray-400">({dim.score}/{dim.maxScore})</span>

                      </div>

                      <span className={"text-sm font-bold " + color.text}>{ratio.toFixed(1)}%</span>

                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-2.5">

                      <div

                        className="h-full rounded-full transition-all duration-700"

                        style={{ width: `${ratio}%`, backgroundColor: color.bar }}

                      />

                    </div>

                    {dim.standards && dim.standards.length > 0 && (

                      <div className="grid grid-cols-3 gap-2">

                        {dim.standards.map(s => {

                          const sRatio = s.maxScore > 0 ? s.score / s.maxScore : 0

                          return (

                            <div key={s.id} className="bg-gray-50 rounded-lg px-3 py-2">

                              <div className="flex items-center justify-between">

                                <span className="text-xs text-gray-600 leading-tight">{s.name}</span>

                                <span className={"text-xs font-semibold " + (sRatio >= 0.9 ? "text-green-600" : sRatio >= 0.75 ? "text-blue-600" : sRatio >= 0.6 ? "text-yellow-600" : "text-red-600")}>{s.score}/{s.maxScore}</span>

                              </div>

                            </div>

                          )

                        })}

                      </div>

                    )}

                    {dim.comment && (

                      <div className={"rounded-lg p-3 " + level.bg}>

                        <div className="flex items-center gap-1.5 mb-1">

                          <div className={"w-1.5 h-1.5 rounded-full " + level.dotColor} />

                          <span className={"text-xs font-semibold " + level.color}>

                            {level.label}

                            {level.label === "优秀" && " (≥90%)"}

                            {level.label === "合格" && " (≥75%)"}

                            {level.label === "不合格" && " (<75%)"}

                          </span>

                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed">{dim.comment}</p>

                      </div>

                    )}

                  </div>

                )

              })}

            </div>

          )}



          {/* 观察备注 */}

          <div className="bg-white rounded-xl p-5 border border-gray-100 space-y-4">

            <h2 className="text-base font-semibold text-gray-800">观察备注</h2>

            {result.highlights && result.highlights.length > 0 && (

              <div className="space-y-2">

                <div className="flex items-center gap-1.5">

                  <Check className="w-4 h-4 text-[#1677ff]" />

                  <span className="font-semibold text-[#1677ff] text-sm">优点</span>

                </div>

                <ol className="space-y-1.5 pl-4">

                  {result.highlights.map((h, i) => (

                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">

                      <span className="text-gray-400 font-medium flex-shrink-0">{i + 1}.</span>

                      <span>{h}</span>

                    </li>

                  ))}

                </ol>

              </div>

            )}

            {result.suggestions && result.suggestions.length > 0 && (

              <div className="space-y-2">

                <div className="flex items-center gap-1.5">

                  <LightbulbIcon className="w-4 h-4 text-orange-500" />

                  <span className="font-semibold text-orange-500 text-sm">建议</span>

                </div>

                <ol className="space-y-1.5 pl-4">

                  {result.suggestions.map((s, i) => (

                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">

                      <span className="text-gray-400 font-medium flex-shrink-0">{i + 1}.</span>

                      <span>{s}</span>

                    </li>

                  ))}

                </ol>

              </div>

            )}

            {result.overallComment && (

              <div className="space-y-2">

                <div className="flex items-center gap-1.5">

                  <FileText className="w-4 h-4 text-gray-500" />

                  <span className="font-semibold text-gray-700 text-sm">总体评语</span>

                </div>

                <p className="text-sm text-gray-600 leading-relaxed pl-5">{result.overallComment}</p>

              </div>

            )}

          </div>



          {/* 云端同步状态 */}

          <div className={"flex items-center gap-2 rounded-lg p-3 text-sm " + (

            cloudStatus === "success" ? "bg-green-50 border border-green-200 text-green-700" :

            cloudStatus === "error" ? "bg-red-50 border border-red-200 text-red-700" :

            "bg-blue-50 border border-blue-200 text-blue-700"

          )}>

            <Database className="w-4 h-4 flex-shrink-0" />

            {cloudStatus === "success" ? (

              <span>评课记录已保存到WPS多维表（数据持久化存储）</span>

            ) : cloudStatus === "error" ? (

              <span>保存到多维表失败，数据仅保留在本地浏览器（不影响使用）</span>

            ) : (

              <><Loader2 className="w-4 h-4 animate-spin" /><span>正在保存到WPS多维表...</span></>

            )}

          </div>



          {/* 操作按钮 */}

          <div className="flex gap-3">

            <button

              onClick={() => navigate("/review/history")}

              className="btn-secondary flex-1"

            >

              查看历史记录

            </button>

            <button

              onClick={() => {

                setStep(1)

                setFormData(prev => ({ ...prev, content: "" }))

                setResult(null)

                setCloudStatus(null)

              }}

              className="btn-primary flex-1"

            >

              继续评课

            </button>

          </div>

        </div>

        )

      })()}

    </div>

  )

}

