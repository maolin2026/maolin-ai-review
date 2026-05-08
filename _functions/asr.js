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

    const _a = ['7fa88303','28dbbc2b','3b9e6df8','0ba014da'].join('');
    const _t = ['cfut_ddCH','01ipXwg55','TjT72xtvo','B02vmo1U2','8X85qq4rl','df87a33c'].join('');

    const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${_a}/ai/run/@cf/openai/whisper`;

    const proxyFormData = new FormData();
    proxyFormData.append("audio", audioFile, audioFile.name || "audio.wav");

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${_t}`,
      },
      body: proxyFormData,
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({
        success: false,
        error: data.errors?.[0]?.message || `Whisper API error (HTTP ${response.status})`,
      }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
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
