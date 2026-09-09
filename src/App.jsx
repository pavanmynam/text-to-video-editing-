import { useState } from "react"
import { fal } from "@fal-ai/client"

// Vercel env var nundi key teesukuntundi
fal.config({
  credentials: import.meta.env.VITE_FAL_KEY,
})

function App() {
  const [prompt, setPrompt] = useState("cinematic Charminar Hyderabad sunset 4k golden hour")
  const [videoUrl, setVideoUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [status, setStatus] = useState("")

  const handleGenerate = async () => {
    if (!prompt) {
      setError("Prompt rayi bro!")
      return
    }
    setLoading(true)
    setError("")
    setVideoUrl("")
    setStatus("Starting...")

    try {
      // Key check
      if (!import.meta.env.VITE_FAL_KEY) {
        throw new Error("VITE_FAL_KEY ledu Vercel lo! Env var check chey")
      }

      const result = await fal.subscribe("fal-ai/minimax-video", {
        input: {
          prompt: prompt,
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_QUEUE") {
            setStatus(`Queue lo unnav - position: ${update.queue_position}`)
          } else if (update.status === "IN_PROGRESS") {
            setStatus("Generating video... ⏳")
            if (update.logs) {
              update.logs.map((log) => log.message).forEach((msg) => console.log(msg))
            }
          }
        },
      })

      console.log("RESULT:", result)
      if (result.data && result.data.video && result.data.video.url) {
        setVideoUrl(result.data.video.url)
        setStatus("Done! ✅")
      } else {
        throw new Error("Video URL raledu - result: " + JSON.stringify(result))
      }

    } catch (err) {
      console.error("FULL ERROR OBJECT:", err)
      // Full error chupistundi - khali undadu
      const msg = err.message || JSON.stringify(err) || "Unknown error"
      setError(msg)
      setStatus("Failed ❌")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "white", padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        🎬 Pavan AI <span style={{ background: "#10b981", fontSize: "12px", padding: "4px 10px", borderRadius: "20px" }}>LIVE</span>
      </h1>
      <p style={{ color: "#888" }}>Super Premium Design - Mardhu! 🔥</p>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px", flexWrap: "wrap" }}>
        {/* Left */}
        <div style={{ background: "#1a1a1a", padding: "20px", borderRadius: "15px", width: "320px" }}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            style={{ width: "100%", padding: "10px", borderRadius: "10px", background: "#2a2a2a", color: "white", border: "1px solid #333" }}
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{ width: "100%", marginTop: "15px", padding: "12px", borderRadius: "10px", border: "none", background: "linear-gradient(to right, #7c3aed, #ec4899)", color: "white", fontWeight: "bold", cursor: "pointer" }}
          >
            {loading ? "Generating..." : "✨ Generate"}
          </button>

          {status && <div style={{ marginTop: "10px", padding: "8px", background: "#222", borderRadius: "8px", fontSize: "13px" }}>{status}</div>}
          {error && <div style={{ marginTop: "10px", padding: "10px", background: "#3a1a1a", borderRadius: "8px", color: "#ff6b6b", fontSize: "12px", wordBreak: "break-all" }}>Error: {error}</div>}
        </div>

        {/* Right */}
        <div style={{ background: "#1a1a1a", padding: "20px", borderRadius: "15px", flex: 1, minWidth: "320px", minHeight: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {videoUrl ? (
            <video src={videoUrl} controls autoPlay loop style={{ width: "100%", borderRadius: "10px" }} />
          ) : (
            <p style={{ color: "#666" }}>Video ikkada vasthundi</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
