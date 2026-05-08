// 评课标准配置
// 茂林磨课19条标准（满分100分）—— 用于评教案、评磨课
// 茂林好课21条标准（满分100分）—— 用于评实录

// ==================== 茂林磨课标准（19条，100分） ====================
export const REVIEW_DIMENSIONS = [
  {
    id: "preparation",
    name: "教学准备",
    weight: 15,
    standards: [
      { id: "p1", name: "教学目标明确", description: "教学目标符合课标要求，准确、具体、可检测", maxScore: 5 },
      { id: "p2", name: "重点难点把握", description: "准确把握教材重点难点，处理得当", maxScore: 5 },
      { id: "p3", name: "教学准备充分", description: "教具、课件、板书设计等准备充分，符合教学需要", maxScore: 5 },
    ]
  },
  {
    id: "content",
    name: "教学内容",
    weight: 25,
    standards: [
      { id: "c1", name: "内容准确无误", description: "教学内容科学准确，无知识性错误", maxScore: 5 },
      { id: "c2", name: "知识结构清晰", description: "知识讲解条理清晰，逻辑性强，层次分明", maxScore: 5 },
      { id: "c3", name: "教材处理得当", description: "对教材内容的处理和重组合理有效", maxScore: 5 },
      { id: "c4", name: "例题选择恰当", description: "例题典型、梯度合理，有助于学生理解", maxScore: 5 },
      { id: "c5", name: "练习设计有效", description: "课堂练习设计有针对性、层次性和拓展性", maxScore: 5 },
    ]
  },
  {
    id: "method",
    name: "教学方法",
    weight: 25,
    standards: [
      { id: "m1", name: "教学方法灵活", description: "根据教学内容和学生实际灵活选择教学方法", maxScore: 5 },
      { id: "m2", name: "启发式教学", description: "善于启发引导，注重培养学生的思维能力和探究意识", maxScore: 5 },
      { id: "m3", name: "互动有效", description: "师生互动、生生互动充分有效，课堂氛围活跃", maxScore: 5 },
      { id: "m4", name: "时间分配合理", description: "各教学环节时间分配合理，节奏把控得当", maxScore: 5 },
      { id: "m5", name: "信息技术运用", description: "合理运用信息技术手段辅助教学，效果良好", maxScore: 5 },
    ]
  },
  {
    id: "effect",
    name: "教学效果",
    weight: 20,
    standards: [
      { id: "e1", name: "学生参与度高", description: "学生积极主动参与课堂学习活动", maxScore: 5 },
      { id: "e2", name: "目标达成度高", description: "教学目标达成度高，学生掌握效果好", maxScore: 5 },
      { id: "e3", name: "反馈及时有效", description: "能及时获取学生反馈并做出针对性调整", maxScore: 5 },
      { id: "e4", name: "分层教学落实", description: "关注不同层次学生的学习需求，因材施教", maxScore: 5 },
    ]
  },
  {
    id: "literacy",
    name: "教师素养",
    weight: 15,
    standards: [
      { id: "l1", name: "语言表达规范", description: "教学语言准确、简洁、生动，富有感染力", maxScore: 5 },
      { id: "l2", name: "板书设计合理", description: "板书设计规范、美观，突出教学重点", maxScore: 5 },
    ]
  }
]

// ==================== 茂林好课标准（21条，100分） ====================
export const GOOD_CLASS_DIMENSIONS = [
  {
    id: "seven_steps",
    name: "七步教学法",
    weight: 30,
    standards: [
      { id: "s1", name: "练习测错题讲解", description: "高频错题，清晰讲解，能归纳拓展", maxScore: 3 },
      { id: "s2", name: "进门考/出门考", description: "组织高效，纪律良好", maxScore: 2 },
      { id: "s3", name: "课堂引入", description: "引入恰当，能够吸引学生，与授课联系紧密", maxScore: 5 },
      { id: "s4", name: "新课突破", description: "教学目标清晰，有效突破重难点、易错点", maxScore: 7 },
      { id: "s5", name: "练习巩固", description: "巩固练习设计、讲解合理，帮助学生充分吸收", maxScore: 5 },
      { id: "s6", name: "总结", description: "引导学生总结方法，举一反三", maxScore: 4 },
      { id: "s7", name: "作业", description: "作业布置清晰、合理有针对性", maxScore: 4 },
    ]
  },
  {
    id: "interest",
    name: "激发兴趣",
    weight: 20,
    standards: [
      { id: "i1", name: "幽默", description: "注重营造课堂幽默氛围，有2-3次笑声，整体课堂氛围轻松，老师面带笑容", maxScore: 5 },
      { id: "i2", name: "激情", description: "激情，传递正能量，传递好的精气神，声音洪亮、流畅、普通话、抑扬顿挫", maxScore: 5 },
      { id: "i3", name: "互动", description: "关注每一个学生，状态、心态、有温度，提问语言简明有效/频率、对学生观点的回应质量", maxScore: 5 },
      { id: "i4", name: "激励", description: "积极鼓励，抓住学生闪光进行合适的表扬，激发兴趣", maxScore: 5 },
    ]
  },
  {
    id: "inspire",
    name: "启发式教学",
    weight: 12,
    standards: [
      { id: "h1", name: "问题设计", description: "提问具有层次性（从具体到抽象），能激发学生深度探究，几乎无低效提问（是不是、对不对）", maxScore: 6 },
      { id: "h2", name: "思维培养", description: "给足学生思考空间，注重追问学生回答思考过程", maxScore: 6 },
    ]
  },
  {
    id: "habit",
    name: "培养习惯",
    weight: 10,
    standards: [
      { id: "b1", name: "习惯引导", description: "引导每一个学生坐姿、眼神、笔记、书写、草稿（语言）", maxScore: 5 },
      { id: "b2", name: "习惯落实", description: "定期检查笔记/草稿，观察课后习惯落实情况（桌面）", maxScore: 5 },
    ]
  },
  {
    id: "implement",
    name: "注重落实",
    weight: 10,
    standards: [
      { id: "im1", name: "及时反馈", description: "对学生错误即时纠正，通过重点复述检验学生对知识的理解程度", maxScore: 5 },
      { id: "im2", name: "高效落实", description: "按时完成课堂目标，课后——过关，学生掌握运用好", maxScore: 5 },
    ]
  },
  {
    id: "temperament",
    name: "教师气质",
    weight: 8,
    standards: [
      { id: "t1", name: "仪态仪表", description: "着装整洁大方，教姿教态好", maxScore: 4 },
      { id: "t2", name: "综合素养", description: "课堂管控，应对能力", maxScore: 4 },
    ]
  },
  {
    id: "guarantee",
    name: "教学保障",
    weight: 5,
    standards: [
      { id: "g1", name: "板书设计", description: "板书设计合理精美，零错误，分区板书逻辑清晰，字迹工整，红黑笔使用准确，重点突出", maxScore: 5 },
    ]
  },
  {
    id: "overall",
    name: "整体感受",
    weight: 5,
    standards: [
      { id: "o1", name: "整体感受", description: "如你的孩子在本班学习，根据孩子的学习收获你会做其他选择吗？可以接受3分，非常愿意继续学习5分", maxScore: 5 },
    ]
  }
]

// ==================== 通用工具函数 ====================

// 获取所有标准的扁平列表
export function getAllStandards(type) {
  const dimensions = type === "class_recording" ? GOOD_CLASS_DIMENSIONS : REVIEW_DIMENSIONS
  return dimensions.flatMap(dim =>
    dim.standards.map(s => ({ ...s, dimension: dim.name, dimensionId: dim.id }))
  )
}

// 验证总分是否为100
export const TOTAL_MAX_SCORE = getAllStandards("lesson_plan").reduce((sum, s) => sum + s.maxScore, 0)
export const GOOD_CLASS_TOTAL_SCORE = getAllStandards("class_recording").reduce((sum, s) => sum + s.maxScore, 0)

// 评课类型
export const REVIEW_TYPES = {
  lesson_plan: "评教案",
  lesson_polish: "评磨课",
  class_recording: "评实录",
}

// 评课类型配置（含图标和描述）
export const REVIEW_TYPE_OPTIONS = [
  { value: "lesson_plan", label: "评教案", iconKey: "FileText", desc: "评审教师教案设计（茂林磨课标准）" },
  { value: "lesson_polish", label: "评磨课", iconKey: "Hammer", desc: "评审磨课过程（茂林磨课标准）" },
  { value: "class_recording", label: "评实录", iconKey: "Video", desc: "评审课堂实录记录（茂林好课标准）" },
]

// 达标线
export const PASS_SCORE = 85

// 四级评级体系
export const RATING_LEVELS = [
  { key: "excellent", label: "优秀", min: 90, max: 100, color: "#22c55e", bgColor: "#f0fdf4", borderColor: "#bbf7d0" },
  { key: "good", label: "良好", min: 75, max: 89, color: "#3b82f6", bgColor: "#eff6ff", borderColor: "#bfdbfe" },
  { key: "pass", label: "合格", min: 60, max: 74, color: "#f59e0b", bgColor: "#fffbeb", borderColor: "#fde68a" },
  { key: "improve", label: "待改进", min: 0, max: 59, color: "#ef4444", bgColor: "#fef2f2", borderColor: "#fecaca" },
]

/**
 * 根据总分获取评级信息
 * @param {number} score - 总分
 * @returns {{ key: string, label: string, color: string, bgColor: string, borderColor: string }}
 */
export function getRating(score) {
  return RATING_LEVELS.find(r => score >= r.min && score <= r.max) || RATING_LEVELS[RATING_LEVELS.length - 1]
}

// AI评课提示词模板
export function buildReviewPrompt(type, teacherName, grade, subject, content) {
  const allStandards = getAllStandards(type)
  const standardList = allStandards.map((s, i) =>
    `${i + 1}. ${s.name}（${s.dimension}）：${s.description}（满分${s.maxScore}分）`
  ).join("\n")

  const typeName = REVIEW_TYPES[type] || type
  const standardName = type === "class_recording" ? "茂林好课标准" : "茂林磨课标准"

  return `你是一位经验丰富的小学数学教学评审专家。请根据${standardName}，对以下${typeName}内容进行专业评审。

评审教师：${teacherName}
年级：${grade}
学科：数学
${typeName}内容：
${content}

请严格按照以下${allStandards.length}条标准逐项评分，并给出综合评价。

${standardList}

【重要评分要求】
1. 严格评分，拉开差距：
   - 不要给满分！即使是表现很好的课堂，也应扣1-2分体现改进空间
   - 总分通常应在60-88分之间，90分以上仅限教学极其优秀的课堂
   - 每个维度内的不同标准项要有分差，不要全部给同一分值
2. dimensions必须按大维度分组（如"七步教学法"含7个子项），不要把每个子项当作独立维度
3. 评语要具体，指出具体问题和改进方向，不要泛泛而谈

请严格按以下JSON格式返回（dimensions按大维度分组，每个维度包含standards子数组）：
{
  "totalScore": <总分>,
  "dimensions": [
    {
      "dimensionId": "<大维度ID，如seven_steps>",
      "name": "<大维度名称，如七步教学法>",
      "score": <该大维度总得分>,
      "maxScore": <该大维度满分，如30>",
      "standards": [
        {"id": "s1", "name": "练习测错题讲解", "score": <得分>, "maxScore": 3, "comment": "<具体评语>"},
        {"id": "s2", "name": "进门考/出门考", "score": <得分>, "maxScore": 2, "comment": "<具体评语>"}
      ],
      "comment": "<该维度综合评语>"
    }
  ],
  "overallComment": "<总体评语>",
  "suggestions": ["<改进建议1>", "<改进建议2>", "<改进建议3>"],
  "highlights": ["<亮点1>", "<亮点2>"]
}`
}
