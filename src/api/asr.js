/**
 * 语音转文字 - SiliconFlow SenseVoiceSmall
 * 前端直接上传原始音频文件，无需分段/转码
 * 通过 Pages Function (/asr) 代理调用 SiliconFlow API
 */

/**
 * 将音频文件转为文字
 * @param {File} audioFile - 音频文件（mp3/wav/m4a/opus 等任意格式）
 * @param {function} onProgress - 进度回调 (percent: number, msg: string)
 * @returns {Promise<string>} 转写后的文字
 */
export async function transcribeAudio(audioFile, onProgress) {
  if (!audioFile) {
    throw new Error("请选择音频文件");
  }

  onProgress && onProgress(10, "准备上传音频...");

  const formData = new FormData();
  formData.append("audio", audioFile);

  onProgress && onProgress(30, "正在转写语音，请稍候...");

  const response = await fetch("/asr", {
    method: "POST",
    body: formData,
  });

  onProgress && onProgress(70, "正在解析转写结果...");

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `转写请求失败 (HTTP ${response.status})`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "语音转写失败");
  }

  const text = data.text || "";
  if (!text.trim()) {
    throw new Error("转写结果为空，请检查音频文件是否清晰");
  }

  onProgress && onProgress(100, "转写完成");
  return text;
}
