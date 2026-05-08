/**
 * CF Pages Function - 教师管理 API (自包含模式)
 * 
 * GET    /api/teachers       - 获取所有教师（从 KV 或初始数据）
 * POST   /api/teachers       - 添加教师
 * PUT    /api/teachers       - 更新教师（body 含 id）
 * DELETE /api/teachers?id=x  - 删除教师
 * 
 * POST   /api/teachers/sync - 灵犀调用，同步多维表数据到 KV
 * 
 * 数据来源（优先级）：KV > 初始数据
 * 灵犀定期调用 /api/teachers/sync 同步多维表数据到 KV
 */

const INITIAL_TEACHERS = [
  { id: "ML0119", name: "\u674e\u989c", grade: "\u56db\u5e74\u7ea7", role: "admin", group: "\u6559\u5b66\u4e3b\u7ba1", password: "maolin2026" },
  { id: "ML0138", name: "\u6768\u8f76\u7537", grade: "\u4e09\u5e74\u7ea7", role: "teacher", group: "\u7ec4\u957f", password: "maolin2026" },
  { id: "ML0273", name: "\u664f\u5bb6\u9e4f", grade: "\u4e09\u5e74\u7ea7", role: "teacher", group: "", password: "maolin2026" },
  { id: "ML0179", name: "\u590f\u5513", grade: "\u4e09\u5e74\u7ea7", role: "teacher", group: "", password: "maolin2026" },
  { id: "ML0375", name: "\u7f57\u5ff5", grade: "\u4e09\u5e74\u7ea7", role: "teacher", group: "", password: "maolin2026" },
  { id: "ML0383", name: "\u67f3\u8bd7\u82d7", grade: "\u4e09\u5e74\u7ea7", role: "teacher", group: "", password: "maolin2026" },
  { id: "ML0392", name: "\u6bdb\u5a1c", grade: "\u4e09\u5e74\u7ea7", role: "teacher", group: "", password: "maolin2026" },
  { id: "ML0402", name: "\u6797\u946b", grade: "\u4e09\u5e74\u7ea7", role: "teacher", group: "", password: "maolin2026" },
  { id: "ML0098", name: "\u674e\u4e3d\u971e", grade: "\u56db\u5e74\u7ea7", role: "teacher", group: "\u7ec4\u957f", password: "maolin2026" },
  { id: "ML0272", name: "\u8983\u6d77\u4e3d", grade: "\u56db\u5e74\u7ea7", role: "teacher", group: "", password: "maolin2026" },
  { id: "ML0277", name: "\u5b59\u8587", grade: "\u56db\u5e74\u7ea7", role: "teacher", group: "", password: "maolin2026" },
  { id: "ML0297", name: "\u5ed6\u4e00\u9c94", grade: "\u56db\u5e74\u7ea7", role: "teacher", group: "", password: "maolin2026" },
  { id: "ML0089", name: "\u674e\u5c27", grade: "\u56db\u5e74\u7ea7", role: "teacher", group: "", password: "maolin2026" },
  { id: "ML0344", name: "\u5468\u654f", grade: "\u56db\u5e74\u7ea7", role: "teacher", group: "", password: "maolin2026" },
  { id: "ML0405", name: "\u90b9\u96e8\u5f64", grade: "\u56db\u5e74\u7ea7", role: "teacher", group: "", password: "maolin2026" },
  { id: "ML0006", name: "\u4ee3\u4f1f", grade: "\u4e94\u5e74\u7ea7", role: "teacher", group: "", password: "maolin2026" },
  { id: "ML0175", name: "\u96f7\u654f", grade: "\u4e94\u5e74\u7ea7", role: "teacher", group: "\u7ec4\u957f", password: "maolin2026" },
  { id: "ML0298", name: "\u9c81\u946b", grade: "\u4e94\u5e74\u7ea7", role: "teacher", group: "", password: "maolin2026" },
  { id: "ML0168", name: "\u6e5b\u4e50\u5929", grade: "\u4e94\u5e74\u7ea7", role: "teacher", group: "", password: "maolin2026" },
  { id: "ML0363", name: "\u674e\u5f69\u8679", grade: "\u4e94\u5e74\u7ea7", role: "teacher", group: "", password: "maolin2026" },
  { id: "ML0414", name: "\u5434\u8476", grade: "\u4e94\u5e74\u7ea7", role: "teacher", group: "", password: "maolin2026" },
  { id: "ML0170", name: "\u738b\u7426", grade: "\u516d\u5e74\u7ea7", role: "teacher", group: "\u7ec4\u957f", password: "maolin2026" },
  { id: "ML0280", name: "\u5f20\u601d\u7426", grade: "\u516d\u5e74\u7ea7", role: "teacher", group: "", password: "maolin2026" },
  { id: "ML0303", name: "\u674e\u5bb6\u8c6a", grade: "\u516d\u5e74\u7ea7", role: "teacher", group: "", password: "maolin2026" },
  { id: "ML0314", name: "\u5468\u6e38", grade: "\u516d\u5e74\u7ea7", role: "teacher", group: "", password: "maolin2026" },
  { id: "ML0385", name: "\u9ec4\u5a01", grade: "\u516d\u5e74\u7ea7", role: "teacher", group: "", password: "maolin2026" },
  { id: "ML0415", name: "\u5468\u96c5\u4e3d", grade: "\u516d\u5e74\u7ea7", role: "teacher", group: "", password: "maolin2026" },
];

// GRADES constant
const GRADES = ["\u4e09\u5e74\u7ea7", "\u56db\u5e74\u7ea7", "\u4e94\u5e74\u7ea7", "\u516d\u5e74\u7ea7", "\u4e03\u5e74\u7ea7", "\u516b\u5e74\u7ea7", "\u4e5d\u5e74\u7ea7"];

const KV_KEY = "teachers_data";
let memoryCache = null;

async function getTeachers(context) {
  if (memoryCache) return memoryCache;
  
  // Try KV first
  if (context.env?.TEACHERS_KV) {
    try {
      const cached = await context.env.TEACHERS_KV.get(KV_KEY);
      if (cached) {
        memoryCache = JSON.parse(cached);
        return memoryCache;
      }
    } catch (e) { /* fallthrough */ }
  }
  
  // Fallback to initial data
  memoryCache = INITIAL_TEACHERS;
  return memoryCache;
}

async function saveTeachers(context, teachers) {
  memoryCache = teachers;
  if (context.env?.TEACHERS_KV) {
    try {
      await context.env.TEACHERS_KV.put(KV_KEY, JSON.stringify(teachers));
    } catch (e) {
      console.error("KV save failed:", e);
    }
  }
}

function jsonResp(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// ===== Sync endpoints =====
// POST /api/teachers/sync - 灵犀调用，用多维表数据替换 KV
// GET  /api/teachers/sync - 获取当前缓存数据（调试用）

async function handleSyncPost(context) {
  try {
    const body = await context.request.json();
    
    if (!body.teachers || !Array.isArray(body.teachers)) {
      return jsonResp({ success: false, error: "需要 teachers 数组" }, 400);
    }
    
    await saveTeachers(context, body.teachers);
    
    return jsonResp({ 
      success: true, 
      message: "同步成功", 
      total: body.teachers.length,
    });
  } catch (err) {
    return jsonResp({ success: false, error: err.message }, 500);
  }
}

async function handleSyncGet(context) {
  try {
    const teachers = await getTeachers(context);
    return jsonResp({ success: true, teachers, total: teachers.length });
  } catch (err) {
    return jsonResp({ success: false, error: err.message }, 500);
  }
}

// ===== Main request handler =====
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;
  const method = context.request.method;
  
  // CORS
  if (method === "OPTIONS") {
    return jsonResp(null);
  }
  
  // Sync sub-route
  if (path.endsWith("/sync")) {
    if (method === "POST") return handleSyncPost(context);
    if (method === "GET") return handleSyncGet(context);
    return jsonResp({ success: false, error: "Method not allowed" }, 405);
  }
  
  try {
    const teachers = await getTeachers(context);
    
    switch (method) {
      case "GET": {
        // Filter out internal _recordId
        const cleaned = teachers.map(({ _recordId, ...t }) => t);
        return jsonResp({ success: true, teachers: cleaned });
      }
      
      case "POST": {
        const body = await context.request.json();
        if (!body.name) {
          return jsonResp({ success: false, error: "教师姓名不能为空" }, 400);
        }
        
        const newTeacher = {
          id: body.id || "ML" + Date.now(),
          name: body.name,
          grade: body.grade || "\u56db\u5e74\u7ea7",
          role: body.role || "teacher",
          group: body.group || "",
          password: body.password || "maolin2026",
        };
        
        teachers.push(newTeacher);
        await saveTeachers(context, teachers);
        
        return jsonResp({ success: true, teacher: newTeacher });
      }
      
      case "PUT": {
        const body = await context.request.json();
        if (!body.id) {
          return jsonResp({ success: false, error: "缺少教师工号" }, 400);
        }
        
        const idx = teachers.findIndex(t => t.id === body.id);
        if (idx === -1) {
          return jsonResp({ success: false, error: "未找到该教师" }, 404);
        }
        
        teachers[idx] = { ...teachers[idx], ...body };
        await saveTeachers(context, teachers);
        
        return jsonResp({ success: true });
      }
      
      case "DELETE": {
        const teacherId = url.searchParams.get("id");
        if (!teacherId) {
          return jsonResp({ success: false, error: "缺少教师工号" }, 400);
        }
        
        const idx = teachers.findIndex(t => t.id === teacherId);
        if (idx === -1) {
          return jsonResp({ success: false, error: "未找到该教师" }, 404);
        }
        
        teachers.splice(idx, 1);
        await saveTeachers(context, teachers);
        
        return jsonResp({ success: true });
      }
      
      default:
        return jsonResp({ success: false, error: "Method not supported" }, 405);
    }
  } catch (err) {
    return jsonResp({ success: false, error: err.message }, 500);
  }
}
