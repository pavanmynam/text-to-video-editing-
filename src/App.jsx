import { useState } from "react"
import { fal } from "@fal-ai/client"

export default function App(){
  const [prompt,setPrompt]=useState("Telugu festival at Charminar Hyderabad, cinematic 4k")
  const [video,setVideo]=useState("")
  const [loading,setLoading]=useState(false)

  const generate=async()=>{
    const KEY = import.meta.env.VITE_FAL_KEY
    if(!KEY) return alert("Key Missing!")
    fal.config({credentials: KEY})
    setLoading(true); setVideo("")
    try{
      console.log("Generating:", prompt)
      const result = await fal.subscribe("fal-ai/minimax-video/text-to-video", {
        input: { prompt: prompt },
        logs: true,
        onQueueUpdate: (u)=> console.log(u.status)
      })
      console.log(result)
      setVideo(result.data.video.url)
    }catch(err){
      console.error(err)
      alert("Error: " + err.message + "\nScreenshot teesi pampu bro")
    }
    setLoading(false)
  }

  return(
    <div style={{padding:20, background:'#000', color:'#fff', minHeight:'100vh'}}>
      <h2>🎬 Pavan AI - Key: {import.meta.env.VITE_FAL_KEY ? "✅ Ready" : "❌ Missing"}</h2>
      <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} style={{width:'100%', height:80, background:'#222', color:'#fff', padding:10, borderRadius:8}}/>
      <button onClick={generate} disabled={loading} style={{marginTop:10, padding:'12px 20px', background:'white', color:'black', fontWeight:'bold', borderRadius:8, width:'100%'}}>
        {loading ? "Generating 30s... Wait bro" : "Generate Video"}
      </button>
      {video && <video src={video} controls autoPlay style={{marginTop:20, width:'100%', borderRadius:12, border:'2px solid #333'}}/>}
      {video && <a href={video} download style={{display:'block', marginTop:10, color:'#0ff'}}>⬇️ Download Video</a>}
    </div>
  )
}
