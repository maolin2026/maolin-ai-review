/**
 * WPS 多维表 API 封装
 *
 * 架构说明：
 * - 前端评课完成后，数据写入 Cloudflare D1 数据库（通过 /api/reviews）
 * - 灵犀定期调用 /api/sync-dbsheet 获取未同步记录
 * - 灵犀使用此模块直接调用 WPS API 写入多维表（灵犀环境无 CORS 限制）
 * - 写入成功后调用 /api/sync-dbsheet/confirm 标记已同步
 */

// 多维表配置
const DBSHEET_CONFIG = {
  fileId: "p9fvqTUxFrMh15crYKb6rxQt8Xs8SRXuW",
  sheetId: 1,
}

const WPS_API_BASE = "https://api.wps.cn"

/**
 * 调用 WPS 多维表 API（灵犀环境直接调用，无需代理）
 * @param {string} path - API 路径
 * @param {object} body - 请求体
 * @param {string} sid - WPS SID 会话凭证
 */
async function callWpsApi(path, body, sid) {
  const url = WPS_API_BASE + path

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": "wps_sid=" + sid,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error("WPS API 请求失败: " + response.status)
  }

  return response.json()
}

/**
 * 将评课记录写入多维表
 * @param {Object} params - 评课记录参数
 * @param {string} sid - WPS SID 会话凭证
 */
export async function saveReviewToDbsheet(params, sid) {
  const {
    topic,
    teacherName,
    grade,
    classType,
    type,
    reviewerName,
    totalScore,
    passed,
    dimensions,
    overallComment,
    suggestions,
    reviewDate,
  } = params

  const dimensionsText = dimensions.map(d =>
    d.name + "：" + d.score + "/" + d.maxScore + "分"
  ).join("\n")

  const suggestionsText = suggestions
    ? suggestions.map((s, i) => (i + 1) + ". " + s).join("\n")
    : ""

  const today = reviewDate || new Date().toISOString().split("T")[0]

  const record = {
    "课题名称": topic || "",
    "被评教师": teacherName || "",
    "年级": grade || "",
    "班型": classType || "",
    "类型": type === "lesson_plan" ? "评教案" : "评实录",
    "评课日期": today,
    "评课人": reviewerName || "",
    "总分": totalScore || 0,
    "是否达标": passed || false,
    "维度评分": dimensionsText || "",
    "评语": overallComment || "",
    "改进建议": suggestionsText || "",
  }

  try {
    const result = await callWpsApi(
      "/v7/dbsheet/" + DBSHEET_CONFIG.fileId + "/sheets/" + DBSHEET_CONFIG.sheetId + "/records/batch_create",
      { records: [{ fields_value: JSON.stringify(record) }] },
      sid
    )

    if (result.code === 0) {
      return {
        success: true,
        recordId: result.data && result.data.records && result.data.records[0] && result.data.records[0].record_id,
      }
    }

    return { success: false, error: result.msg || "写入失败" }
  } catch (err) {
    console.error("写入多维表失败:", err)
    return { success: false, error: err.message }
  }
}

/**
 * 前端兼容函数 - 新架构下前端不再直接写多维表
 * 前端评课数据通过 /api/reviews 写入 D1，由灵犀同步到多维表
 */
export async function saveReviewToDbsheetFromFrontend(params) {
  // 新架构：前端不做多维表写入，仅返回成功标记
  console.log("评课记录已写入 D1 数据库，将由系统自动同步到多维表")
  return { success: true, skipped: true }
}
