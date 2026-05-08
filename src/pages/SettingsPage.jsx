import { useState } from "react"
import useSettingsStore, { DEFAULT_SETTINGS } from "../stores/settingsStore"
import { testZhipuApiKey } from "../api/zhipu"
import { Settings, Key, Save, RotateCcw, CheckCircle2, XCircle, Loader2, Database, Mic, Info } from "lucide-react"

export default function SettingsPage() {
  const settings = useSettingsStore(s => s.settings)
  const updateSettings = useSettingsStore(s => s.updateSettings)
  const resetToDefault = useSettingsStore(s => s.resetToDefault)

  const [localSettings, setLocalSettings] = useState({ ...settings })
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [saved, setSaved] = useState(false)

  const handleTest = async () => {
    if (!localSettings.zhipuApiKey) {
      setTestResult({ success: false, message: "请先输入API Key" })
      return
    }
    setTesting(true)
    setTestResult(null)
    const ok = await testZhipuApiKey(localSettings.zhipuApiKey)
    setTestResult({
      success: ok,
      message: ok ? "连接成功，API Key有效" : "连接失败，请检查API Key是否正确"
    })
    setTesting(false)
  }

  const handleSave = () => {
    updateSettings(localSettings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    if (confirm("确定要恢复默认设置吗？")) {
      resetToDefault()
      setLocalSettings({ ...DEFAULT_SETTINGS })
      setTestResult(null)
    }
  }

  const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title flex items-center gap-2">
          <Settings className="w-7 h-7" /> 系统设置
        </h1>
        <button onClick={handleReset} className="btn-secondary text-sm flex items-center gap-1">
          <RotateCcw className="w-4 h-4" /> 恢复默认
        </button>
      </div>

      {/* 智谱AI配置 */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-primary-600" />
          <h3 className="section-title">智谱AI配置</h3>
        </div>
        <p className="text-sm text-gray-500">
          配置智谱AI的API Key用于AI评课功能。系统已内置默认Key，通常无需修改。
        </p>

        <div>
          <label className="label-text">API Key</label>
          <div className="flex gap-2">
            <input
              type="password"
              value={localSettings.zhipuApiKey}
              onChange={e => setLocalSettings(s => ({ ...s, zhipuApiKey: e.target.value }))}
              className="input-field flex-1 font-mono text-sm"
              placeholder="请输入智谱AI API Key"
            />
            <button
              onClick={handleTest}
              disabled={testing}
              className="btn-secondary flex items-center gap-1"
            >
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {testing ? "测试中" : "测试连接"}
            </button>
          </div>
          {testResult && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              testResult.success ? "text-green-600" : "text-red-600"
            }`}>
              {testResult.success
                ? <CheckCircle2 className="w-4 h-4" />
                : <XCircle className="w-4 h-4" />
              }
              {testResult.message}
            </div>
          )}
        </div>

        <div>
          <label className="label-text">API地址</label>
          <input
            type="text"
            value={localSettings.zhipuApiUrl}
            onChange={e => setLocalSettings(s => ({ ...s, zhipuApiUrl: e.target.value }))}
            className="input-field font-mono text-sm"
          />
        </div>

        <div>
          <label className="label-text">模型</label>
          <input
            type="text"
            value={localSettings.zhipuModel}
            onChange={e => setLocalSettings(s => ({ ...s, zhipuModel: e.target.value }))}
            className="input-field font-mono text-sm"
          />
        </div>
      </div>

      {/* 语音转写说明 */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-primary-600" />
          <h3 className="section-title">语音转写</h3>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-800">
            <p className="font-medium">SiliconFlow SenseVoiceSmall</p>
            <p className="mt-1">已配置完成，支持中文语音转写。音频文件直接上传至服务端处理，无需前端分段转码。</p>
          </div>
        </div>
      </div>

      {/* 评级标准 */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-primary-600" />
          <h3 className="section-title">评级标准</h3>
        </div>
        <p className="text-sm text-gray-500">系统采用四级评级体系：</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <span className="text-2xl font-bold text-green-600">A</span>
            <div>
              <p className="font-medium text-green-800">优秀</p>
              <p className="text-xs text-green-600">{'总分 >= 90分'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-2xl font-bold text-blue-600">B</span>
            <div>
              <p className="font-medium text-blue-800">良好</p>
              <p className="text-xs text-blue-600">75 ~ 89分</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <span className="text-2xl font-bold text-yellow-600">C</span>
            <div>
              <p className="font-medium text-yellow-800">合格</p>
              <p className="text-xs text-yellow-600">60 ~ 74分</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <span className="text-2xl font-bold text-red-600">D</span>
            <div>
              <p className="font-medium text-red-800">待改进</p>
              <p className="text-xs text-red-600">{'总分 < 60分'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 数据管理 */}
      <div className="card space-y-4">
        <h3 className="section-title">数据管理</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
          <Database className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">WPS多维表云存储</p>
            <p className="mt-1">评课记录和教师数据已持久化到WPS多维表，多端同步、安全可靠。</p>
          </div>
        </div>
      </div>

      {/* 保存按钮 */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`btn-primary flex items-center gap-2 ${saved ? "bg-green-600" : ""}`}
          disabled={!hasChanges && !saved}
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "已保存" : "保存设置"}
        </button>
      </div>
    </div>
  )
}
