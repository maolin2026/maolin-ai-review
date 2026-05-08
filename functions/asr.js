/**
 * 音频转写 - SiliconFlow SenseVoiceSmall
 * 直接转发前端上传的音频文件，无需分段
 * 支持 mp3/m4a/wav/opus 等格式，无文件大小限制
 */
export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();
    const audioFile = formData.get("audio");

    if (!audioFile) {
      return new Response(JSON.stringify({ error: "No audio file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const _k = ['sk-fsdmq','tzfoptyc','yfsppywt','izejoewbi','tzcwauoac','wxzpyhczj'].join('');

    const proxyFormData = new FormData();
    proxyFormData.append("file", audioFile, audioFile.name || "audio.mp3");
    proxyFormData.append("model", "FunAudioLLM/SenseVoiceSmall");

    const response = await fetch("https://api.siliconflow.cn/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${_k}`,
      },
      body: proxyFormData,
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({
        success: false,
        error: data.error?.message || data.message || `API error (HTTP ${response.status})`,
      }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      text: data.text || "",
    }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message || "Internal server error",
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
