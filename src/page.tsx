"use client";
import { useState } from "react";

export default function AIRealVideoEngine() {
  const [prompt, setPrompt] = useState("Ancient temple hidden inside a glowing cave, cinematic 4K");
  const [style, setStyle] = useState("Cinematic");
  const [duration, setDuration] = useState("10s");
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const styles = ["Cinematic", "Anime", "Realistic", "3D"];
  const durations = ["5s", "10s", "15s"];

  const generateVideo = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setVideoUrl(null);
    setProgress(0);

    // Fake progress - replace with real API
    const interval = setInterval(() => {
      setProgress((p) => (p >= 95 ? 95 : p + 7));
    }, 400);

    // TODO: Replace this with your real API call
    // Example for Fal.ai / Replicate:
    // const res = await fetch('/api/generate', { method: 'POST', body: JSON.stringify({ prompt, style, duration }) })
    // const { videoUrl } = await res.json()

    await new Promise((r) => setTimeout(r, 3500));
    clearInterval(interval);
    setProgress(100);
    
    // Mock video for demo - replace with real URL from API
    setVideoUrl("https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
    setGenerating(false);
  };

  const downloadVideo = async () => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `ai-video-${Date.now()}.mp4`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white p-4 md:p-6 font-sans">
      <div className="max-w-[480px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[20px] font-bold tracking-tight">AI Real Text-to-Video Engine</h1>
          <span className="text-[10px] px-2 py-1 rounded-full bg-white/10 border border-white/10">AI</span>
        </div>

        {/* Prompt Card */}
        <div className="bg-[#161617] rounded-[20px] p-4 border border-white/10 shadow-2xl">
          <label className="text-[12px] text-white/50 mb-2 block">Describe your video</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-[#1f1f20] border border-white/10 rounded-xl p-3 text-[14px] min-h-[80px] outline-none focus:border-white/20"
            placeholder="Ancient temple hidden inside a glowing..."
          />

          <div className="mt-4">
            <p className="text-[11px] text-white/40 mb-2">Style</p>
            <div className="flex gap-2 flex-wrap">
              {styles.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`px-3 py-1.5 rounded-full text-[12px] border transition ${style === s ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/60"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-[11px] text-white/40 mb-2">Duration</p>
            <div className="flex gap-2">
              {durations.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`px-4 py-1.5 rounded-full text-[12px] border ${duration === d ? "bg-white text-black" : "bg-white/5 text-white/60 border-white/10"}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generateVideo}
            disabled={generating}
            className="w-full mt-5 bg-white text-black rounded-full py-3.5 text-[14px] font-semibold hover:bg-white/90 disabled:opacity-50"
          >
            {generating ? `Generating... ${progress}%` : "✦ Generate AI Video Storyboard"}
          </button>
        </div>

        {/* SECOND FRAME - Real Video Player */}
        <div className="mt-5 bg-[#161617] rounded-[20px] border border-white/10 overflow-hidden">
          <div className="p-4 flex justify-between items-center">
            <h2 className="text-[13px] font-semibold">Preview Player</h2>
            {videoUrl && <span className="text-[10px] text-green-400">● Ready</span>}
          </div>

          {/* Video Area */}
          <div className="relative aspect-video bg-black">
            {!videoUrl && !generating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">▶</div>
                <p className="text-[13px]">Your video will appear here</p>
                <p className="text-[11px] mt-1">Type a prompt and generate</p>
              </div>
            )}

            {generating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-6">
                <div className="w-full max-w-[200px] h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-white transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-[12px] mt-3 text-white/60">Creating video... {progress}%</p>
              </div>
            )}

            {videoUrl && (
              <>
                <video src={videoUrl} controls className="w-full h-full object-contain" playsInline />
                {/* Download inside player overlay */}
                <button
                  onClick={downloadVideo}
                  className="absolute bottom-14 right-3 bg-white/90 backdrop-blur text-black text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-lg hover:bg-white"
                >
                  ⬇ Download
                </button>
              </>
            )}
          </div>

          {/* Actions after video */}
          {videoUrl && (
            <div className="p-3 flex gap-2">
              <button onClick={downloadVideo} className="flex-1 bg-white text-black rounded-full py-2.5 text-[13px] font-semibold">Download MP4</button>
              <button onClick={generateVideo} className="flex-1 bg-white/10 border border-white/10 rounded-full py-2.5 text-[13px]">Regenerate</button>
            </div>
          )}
        </div>

        <p className="text-[10px] text-white/20 text-center mt-6">Built for Vercel • Replace mock URL with your /api/generate</p>
      </div>
    </div>
  );
}
