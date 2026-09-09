import { useState } from "react"
import { fal } from "@fal-ai/client"

fal.config({ credentials: import.meta.env.VITE_FAL_KEY })

function App() {
  const [prompt, setPrompt] = useState("cinematic Charminar Hyderabad sunset 4k")
  const [videoUrl, setVideoUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [status, setStatus] = useState("")

  const handleGenerate = async () => {
    setLoading(true); setError(""); setVideoUrl(""); setStatus("Starting...")
    try {
      const result = await fal.subscribe("fal-ai/kling-video/v2.1/master/text-to-video", {
        input: { prompt, duration: "5", aspect_ratio: "16:9" },
        logs: true,
        onQueueUpdate: (u) => setStatus(`${u.status} ${u.queue_position||""}`)
      })
      setVideoUrl(result.data.video.url)
      setStatus("Done ✅")
    } catch (err) {
      setError(err.message || JSON.stringify(err).slice(0,300))
      setStatus("Failed ❌")
      console.error(err)
    } finally { setLoading(false) }
  }

  return (
    <div style={{ background:"#0a0a0a", minHeight:"100vh", color:"white", padding:"20px" }}>
      <h1>🎬 Pavan AI <span style={{background:"#10b981", fontSize:"12px", padding:"4px 10px", borderRadius:"20px"}}>LIVE</span></h1>
      <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} rows={4} style={{width:"320px", padding:"10px", borderRadius:"10px", background:"#222", color:"white"}}/>
      <br/><button onClick={handleGenerate} disabled={loading} style={{marginTop:"10px", padding:"12px 20px", borderRadius:"10px", background:"#7c3aed", color:"white", border:"none"}}>{loading?"Generating...":"✨ Generate"}</button>
      <div>{status}</div>
      {error && <div style={{color:"#ff6b6b", marginTop:"10px"}}>Error: {error}</div>}
      <div style={{marginTop:"20px"}}>{videoUrl && <video src={videoUrl} controls style={{width:"500px", borderRadius:"10px"}}/>}</div>
    </div>
  )
}
export default App
