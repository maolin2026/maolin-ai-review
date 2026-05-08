import { REVIEW_TYPES } from "../data/reviewStandards"

// ==================== 四级评级体系 ====================

function getRating(score) {
  if (score >= 90) return { label: "优秀", color: "#16a34a", bgColor: "#f0fdf4", borderColor: "#bbf7d0" }
  if (score >= 75) return { label: "良好", color: "#2563eb", bgColor: "#eff6ff", borderColor: "#bfdbfe" }
  if (score >= 60) return { label: "合格", color: "#d97706", bgColor: "#fffbeb", borderColor: "#fde68a" }
  return { label: "待改进", color: "#dc2626", bgColor: "#fef2f2", borderColor: "#fecaca" }
}

// ==================== 报告HTML生成 ====================

function buildReportHTML(review) {
  const rating = getRating(review.totalScore)
  const typeName = REVIEW_TYPES[review.type] || "评课"
  const date = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })
    : "未知日期"

  const dimensionsHTML = (review.dimensions || [])
    .map(dim => `
      <tr class="tr-dim-head">
        <td colspan="3">${dim.name}（${dim.score}分）</td>
      </tr>
      ${(dim.items || []).map(item => `
        <tr>
          <td class="td-item">${item.name}</td>
          <td class="td-score" style="color: ${getRating(item.score).color}; font-weight: 600;">${item.score}分</td>
          <td class="td-comment">${item.comment || "—"}</td>
        </tr>
      `).join("")}
      ${dim.comment ? `
        <tr>
          <td colspan="3" class="td-dim-comment">${dim.comment}</td>
        </tr>
      ` : ""}
    `).join("")

  const highlightsHTML = (review.highlights || []).length > 0
    ? `<ul class="list highlights">${review.highlights.map(h => `<li>${h}</li>`).join("")}</ul>`
    : `<p class="list empty">暂无</p>`

  const suggestionsHTML = (review.suggestions || []).length > 0
    ? `<ul class="list suggestions">${review.suggestions.map(s => `<li>${s}</li>`).join("")}</ul>`
    : `<p class="list empty">暂无</p>`

  return `
    <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
      <div class="header">
        <h1 class="title">茂林教育 · ${typeName}报告</h1>
        <div class="meta">
          <span>教师：${review.teacherName || "未知"}</span>
          <span>年级：${review.grade || "未知"}</span>
          <span>课题：${review.topic || "无课题"}</span>
          <span>日期：${date}</span>
        </div>
      </div>

      <div class="score-card" style="background: ${rating.bgColor}; border-color: ${rating.borderColor};">
        <div class="score-main" style="color: ${rating.color};">${review.totalScore}<span class="score-unit">分</span></div>
        <div>
          <div class="score-type">${typeName}</div>
          <div class="score-rate">${(review.dimensions || []).length} 个评分维度</div>
          <div class="score-status" style="color: ${rating.color};">${rating.label}</div>
        </div>
      </div>

      <h2 class="section-title blue">评分详情</h2>
      <table class="detail-table">
        <thead>
          <tr class="tr-sub-head">
            <th>评分子项</th>
            <th>分数</th>
            <th>评语</th>
          </tr>
        </thead>
        <tbody>
          ${dimensionsHTML}
        </tbody>
      </table>

      <h2 class="section-title green">亮点</h2>
      ${highlightsHTML}

      <h2 class="section-title orange">改进建议</h2>
      ${suggestionsHTML}

      <h2 class="section-title blue">总体评语</h2>
      <div class="overall-comment">${review.overallComment || "暂无总体评语"}</div>

      <div class="footer">
        茂林教育 · AI智能评课系统 | ${date}
      </div>
    </div>
  `
}

// ==================== 报告CSS样式 ====================

const REPORT_CSS = `
  body { font-family: "Microsoft YaHei", "PingFang SC", sans-serif; color: #334155; line-height: 1.6; padding: 0; margin: 0; background: #fff; }

  .header { text-align: center; margin-bottom: 30px; }

  .title { font-size: 22pt; font-weight: bold; color: #1e3a5f; margin: 0 0 12px; }

  .meta { display: flex; justify-content: center; flex-wrap: wrap; gap: 16px; font-size: 11pt; color: #64748b; }

  .score-card { display: flex; align-items: center; gap: 20px; padding: 20px 24px; border-radius: 12px; border: 2px solid; margin-bottom: 24px; }

  .score-main { font-size: 42pt; font-weight: bold; line-height: 1; }

  .score-unit { font-size: 14pt; opacity: 0.7; }

  .score-type { font-size: 13pt; font-weight: 600; color: #334155; }

  .score-rate { font-size: 12pt; opacity: 0.9; }

  .score-status { font-size: 14pt; font-weight: bold; margin-left: auto; }

  .section-title { font-size: 14pt; margin: 20px 0 10px; padding-bottom: 6px; border-bottom: 2px solid; }

  .section-title.blue { color: #1e3a5f; border-color: #1677ff; }

  .section-title.green { color: #166534; border-color: #22c55e; }

  .section-title.orange { color: #92400e; border-color: #f59e0b; }

  .detail-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; border: 1px solid #e2e8f0; }

  .tr-dim-head td { padding: 6px 8px; font-size: 12pt; font-weight: bold; color: #1e3a5f; border-bottom: 2px solid #e2e8f0; background: #f8fafc; }

  .tr-sub-head th { padding: 4px 8px; font-size: 11pt; color: #475569; background: #f1f5f9; text-align: left; }

  .tr-sub-head th:first-child { width: 30%; }

  .tr-sub-head th:nth-child(2) { width: 15%; text-align: center; }

  .td-item { padding: 4px 8px; font-size: 11pt; color: #666; border: 1px solid #e2e8f0; }

  .td-score { padding: 4px 8px; font-size: 11pt; color: #666; border: 1px solid #e2e8f0; text-align: center; }

  .td-comment { padding: 4px 8px; font-size: 11pt; color: #666; border: 1px solid #e2e8f0; }

  .td-dim-comment { padding: 6px 8px; font-size: 11pt; color: #475569; background: #f0f9ff; border-left: 3px solid #1677ff; border: 1px solid #e2e8f0; }

  .list { margin: 0 0 16px 20px; padding: 0; }

  .highlights li { margin-bottom: 4px; font-size: 11pt; color: #166534; }

  .suggestions li { margin-bottom: 4px; font-size: 11pt; color: #92400e; }

  .list .empty { color: #999; }

  .overall-comment { font-size: 11pt; color: #475569; line-height: 1.8; padding: 10px 14px; background: #f8fafc; border-left: 3px solid #1677ff; margin-bottom: 20px; }

  .footer { margin-top: 40px; text-align: right; font-size: 9pt; color: #94a3b8; }

  @media print { .no-print { display: none !important; } }
`

// ==================== 导出 Word ====================

export function exportReportToWord(review) {
  const html = buildReportHTML(review)
  const fullHTML = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8"><title>评课报告</title>
    <style>${REPORT_CSS}</style>
    <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
    </head><body>${html}</body></html>`

  const blob = new Blob(["\ufeff" + fullHTML], { type: "application/msword;charset=utf-8" })
  downloadBlob(blob, buildFileName(review, ".doc"))
}

// ==================== 导出 PDF ====================

export function exportReportToPDF(review) {
  const html = buildReportHTML(review)
  const fullHTML = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8">
    <title>评课报告 - ${review.teacherName}</title>
    <style>${REPORT_CSS}
      @page { margin: 15mm 20mm; size: A4; }
      body { margin: 0; }
    </style></head><body>
    ${html}
    <div class="no-print" style="text-align:center;margin:30px 0;">
      <button onclick="window.print()" style="padding:10px 30px;font-size:14pt;background:#1677ff;color:#fff;border:none;border-radius:6px;cursor:pointer;margin:0 8px;">打印 / 保存 PDF</button>
      <button onclick="window.close()" style="padding:10px 30px;font-size:14pt;background:#64748b;color:#fff;border:none;border-radius:6px;cursor:pointer;margin:0 8px;">关闭</button>
    </div>
  </body></html>`

  const blob = new Blob([fullHTML], { type: "text/html;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  window.open(url, "_blank")
}

// ==================== 导出图片 ====================

export async function exportReportToImage(review) {
  const container = document.createElement("div")
  container.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:800px;background:#fff;z-index:-1;"
  document.body.appendChild(container)

  const styleEl = document.createElement("style")
  styleEl.textContent = REPORT_CSS
  container.appendChild(styleEl)

  const wrapper = document.createElement("div")
  wrapper.innerHTML = buildReportHTML(review)
  container.appendChild(wrapper)

  await new Promise(r => setTimeout(r, 300))

  try {
    const { default: html2canvas } = await import("html2canvas")
    const canvas = await html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    })
    canvas.toBlob(blob => {
      downloadBlob(blob, buildFileName(review, ".png"))
    }, "image/png")
  } catch (err) {
    console.error("导出图片失败:", err)
    alert("导出图片失败，请稍后重试")
  } finally {
    document.body.removeChild(container)
  }
}

// ==================== 工具函数 ====================

function buildFileName(review, ext) {
  const typeName = REVIEW_TYPES[review.type] || "评课"
  const date = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("zh-CN").replace(/\//g, "-")
    : "unknown"
  return `${typeName}_${review.teacherName || "未知"}_${review.topic || "无课题"}_${date}${ext}`
    .replace(/[/\\:*?"<>|]/g, "_")
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
