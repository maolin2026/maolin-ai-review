import useSettingsStore from "../stores/settingsStore"

import { buildReviewPrompt } from "../data/reviewStandards"



export async function callZhipuReview({ type, teacherName, grade, subject, content, onStream }) {

  const settings = useSettingsStore.getState()

  if (!settings.settings.zhipuApiKey) {

    throw new Error("未配置智谱AI API Key，请在系统设置中配置")

  }



  const prompt = buildReviewPrompt(type, teacherName, grade, subject, content)

  const typeName = type === "class_recording" ? "茂林好课21条标准（8维度）" : "茂林磨课19条标准"

  const systemPrompt = "你是茂林教育小学数学项目组的AI评课助手。请严格按照" + typeName + "进行专业评课。评分严格客观，不要给满分，评语具体有针对性。返回纯JSON格式结果，不要包含markdown代码块标记或其他文字。"



  const response = await fetch(settings.settings.zhipuApiUrl || "https://open.bigmodel.cn/api/paas/v4/chat/completions", {

    method: "POST",

    headers: {

      "Content-Type": "application/json",

      "Authorization": "Bearer " + settings.settings.zhipuApiKey

    },

    body: JSON.stringify({

      model: settings.settings.zhipuModel || "glm-4-flash",

      messages: [

        { role: "system", content: systemPrompt },

        { role: "user", content: prompt }

      ],

      temperature: 0.3,

      top_p: 0.7,

      max_tokens: 4096,

    })

  })



  if (!response.ok) {

    const errorText = await response.text()

    throw new Error("API请求失败 (" + response.status + "): " + errorText)

  }



  const data = await response.json()

  const resultText = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || ""



  var parsed = null

  try {

    var cleanText = resultText.trim()

    if (cleanText.indexOf("```json") === 0) cleanText = cleanText.slice(7)

    else if (cleanText.indexOf("```") === 0) cleanText = cleanText.slice(3)

    if (cleanText.endsWith("```")) cleanText = cleanText.slice(0, -3)

    cleanText = cleanText.trim()

    parsed = JSON.parse(cleanText)

  } catch (parseError) {

    return {

      success: false, totalScore: 0, dimensions: [],

      overallComment: "AI返回结果格式异常，无法解析评分",

      suggestions: [], highlights: [], rawText: resultText,

      parseError: parseError.message

    }

  }



  var D = {preparation:15,content:25,method:25,effect:20,literacy:15,seven_steps:30,interest:20,inspire:12,habit:10,implement:10,temperament:8,guarantee:5,overall:5}

  var S = {p1:5,p2:5,p3:5,c1:5,c2:5,c3:5,c4:5,c5:5,m1:5,m2:5,m3:5,m4:5,m5:5,e1:5,e2:5,e3:5,e4:5,l1:5,l2:5,l3:5,s1:3,s2:2,s3:5,s4:7,s5:5,s6:4,s7:5,i1:5,i2:5,i3:5,i4:5,h1:6,h2:6,b1:5,b2:5,im1:5,im2:5,t1:4,t2:4,g1:5,o1:5}

  var fd = (parsed.dimensions || []).map(function(dim) {

    var did = dim.dimensionId || dim.id || ""

    var dm = D[did] || dim.maxScore || 0

    var fs = (dim.standards || []).map(function(x) {

      var sm = S[x.id] || 5

      return Object.assign({}, x, {score: x.score > sm ? sm : (x.score < 0 ? 0 : x.score), maxScore: sm})

    })

    var cs = 0

    for (var i = 0; i < fs.length; i++) cs += fs[i].score

    if (cs > dm) cs = dm

    return Object.assign({}, dim, {score: cs, maxScore: dm, standards: fs})

  })

  var tt = 0, tm = 0

  for (var j = 0; j < fd.length; j++) {tt += fd[j].score; tm += fd[j].maxScore}

  if (tt > tm) tt = tm



  return {

    success: true,

    totalScore: tt,

    dimensions: fd,

    overallComment: parsed.overallComment || "",

    suggestions: parsed.suggestions || [],

    highlights: parsed.highlights || [],

    rawText: resultText

  }

}



export async function testZhipuApiKey(apiKey) {

  try {

    const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {

      method: "POST",

      headers: {

        "Content-Type": "application/json",

        "Authorization": "Bearer " + apiKey

      },

      body: JSON.stringify({

        model: "glm-4-flash",

        messages: [{ role: "user", content: "你好，请回复测试成功" }],

        max_tokens: 20,

      })

    })

    return response.ok

  } catch (e) {

    return false

  }

}

