"use client";
import { useState } from "react";

export default function PavanAIStudioFixed() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Cinematic");
  const [duration, setDuration] = useState("5");
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) {
      setError("Prompt type cheyyi bro");
      return;
    }
    setLoading(true);
    setError(null);
    setVideoUrl(null);
    setIsDemo(false);

    try {
      const res = await fetch("/api/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style, duration }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Generation failed");
      
      setVideoUrl(data.videoUrl);
      setIsDemo(!!data.isDemo);
    } catch (err: any) {
      setError(err.message || "Video render avvaledu, malli try cheyyi");
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `pavan-ai-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-[520px] mx-auto p-4">
        <div className="flex items-center justify-between py-4 border-b border-white/10 mb-5">
          <h1 className="font-black text-[18px] leading-none">PAVAN AI<br/>STUDIO</h1>
          <span className="text-[11px] text-white/40">Text to Video • Proper App</span>
        </div>

        <div className="bg-[#141415] rounded-[18px] border border-white/10 p-4">
          <p className="text-[11px] text-white/40 mb-2 uppercase tracking-widest">Create Video</p>
          <p className="text-[10px] text-white/30 mb-2">PROMPT</p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: forest walking video a children playing..."
            className="w-full bg-[#1e1e1f] border border-white/10 rounded-xl p-3 text-[14px] min-h-[90px] outline-none focus:border-white/20 resize-none"
          />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-white/30 mb-2">STYLE</p>
              <select value={style} onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-[#1e1e1f] border border-white/10 rounded-xl p-2.5 text-[13px]">
                <option>Cinematic</option>
                <option>Anime</option>
                <option>Realistic</option>
                <option>3D Cartoon</option>
              </select>
            </div>
            <div>
              <p className="text-[10px] text-white/30 mb-2">DURATION: {duration}s</p>
              <input type="range" min={5} max={15} step={5} value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full accent-white mt-3" />
            </div>
          </div>

          <button onClick={generate} disabled={loading}
            className="w-full mt-5 bg-white text-black rounded-full py-3.5 text-[14px] font-bold disabled:opacity-50">
            {loading ? "Rendering Video..." : "Generate Video"}
          </button>

          {error && <p className="text-[12px] text-red-400 mt-3 text-center">{error}</p>}
          <p className="text-[10px] text-white/20 text-center mt-3">Do not refresh, video rendering...</p>
        </div>

        {/* VIDEO PLAYER - This is the fix, direct video, no image step */}
        <div className="mt-5 bg-[#141415] rounded-[18px] border border-white/10 overflow-hidden min-h-[260px]">
          {!videoUrl && !loading && (
            <div className="h-[260px] flex flex-col items-center justify-center text-white/25 p-6 text-center">
              <div className="text-3xl mb-3">🎬</div>
              <p className="text-[13px]">Video ikkada kanipistadi</p>
              <p className="text-[11px] mt-1">Prompt enter chesi Generate kottu</p>
            </div>
          )}

          {loading && (
            <div className="h-[260px] flex flex-col items-center justify-center bg-black">
              <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
              <p className="text-[13px] text-white/70">Video Rendering...</p>
              <p className="text-[11px] text-white/30 mt-1">15-30 sec pattavachu</p>
            </div>
          )}

          {videoUrl && (
            <div className="relative">
              <video src={videoUrl} controls autoPlay playsInline
                className="w-full aspect-video bg-black" />
              <div className="p-3 flex gap-2 bg-[#141415]">
                <button onClick={download}
                  className="flex-1 bg-white text-black rounded-full py-2.5 text-[13px] font-bold">⬇ Download MP4</button>
                <button onClick={() => setVideoUrl(null)}
                  className="px-5 bg-white/10 border border-white/10 rounded-full text-[13px]">Clear</button>
              </div>
              {isDemo && <p className="text-[10px] text-yellow-400/60 text-center pb-3 px-3">Demo video - Vercel lo FAL_KEY add chesthe real AI video vastadi</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
