import { useState } from 'react'
import { fal } from "@fal-ai/client"

fal.config({ credentials: import.meta.env.VITE_FAL_KEY })

function App() {
  const [prompt, setPrompt] = useState("")
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    const result = await fal.subscribe("fal-ai/ltx-video", {
      input: { prompt: prompt }
    })
    setVideo(result.data.video.url)
    setLoading(false)
  }

  return (
    <div style={{padding: 20}}>
      <input value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Enter prompt" style={{width: '300px', padding: 10}} />
      <button onClick={generate} disabled={loading}>{loading ? 'Generating...' : 'Generate Video (10+ videos for $10)'}</button>
      {video && <video src={video} controls autoPlay style={{width: '100%', marginTop: 20}} />}
    </div>
  )
}
export default App
