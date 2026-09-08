import { useState } from 'react'
import { fal } from "@fal-ai/client"

export default function App(){
  const [prompt,setPrompt]=useState("cinematic drone shot of Hyderabad Charminar at sunset, 4k")
  const [video,setVideo]=useState("")
  const [load,setLoad]=useState(false)

  const gen=async()=>{
    const KEY = import.meta.env.VITE_FAL_KEY
    if(!KEY) return alert("Key missing bro! Vercel lo add chey")
    fal.config({ credentials: KEY })
    setLoad(true)
    setVideo("")
    try{
      const res = await fal.subscribe("fal-ai/ltx-2/text-to-video", {
        input: { prompt, duration: "6", resolution: "1080p" }
      })
      setVideo(res.data.video.url)
    }catch(e){
      alert("Error: " + e.message)
    }
    setLoad(false)
  }

  return(
    <div style={{display:'flex', gap:'20px', padding:'20px', background:'#0a0a0a', color:'white', minHeight:'100vh', fontFamily:'sans-serif'}}>
      {/* LEFT */}
      <div style={{flex:1, background:'#161616', padding:'20px', borderRadius:'16px'}}>
        <h1>🎬 Pavan AI Studio</h1>
        <p>Key: {import.meta.env.VITE_FAL_KEY ? "✅ Ready" : "❌ Missing"}</p>
        <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} style={{width:'100%', height:'120px', padding:'12px', borderRadius:'12px', background:'#222', color:'white', border:'1px solid #333'}} placeholder="Enter prompt..."/>
        <button onClick={gen} disabled={load} style={{marginTop:'12px', width:'100%', padding:'14px', borderRadius:'12px', background:'white', color:'black', fontWeight:'bold', cursor:'pointer'}}>
          {load ? "Generating 30s..." : "Generate Video"}
        </button>
      </div>
      {/* RIGHT - VIDEO PAKKANA */}
      <div style={{flex:1.2, background:'#161616', padding:'20px', borderRadius:'16px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', border:'2px dashed #333'}}>
        {!video && !load && <div style={{textAlign:'center', opacity:0.5}}><div style={{fontSize:'40px'}}>🎞️</div><p>Your video will appear here<br/>Click Generate - video pakkane vastadi</p></div>}
        {load && <p>✨ Generating cinematic magic... 30s wait bro</p>}
        {video && <><video src={video} controls autoPlay loop style={{width:'100%', borderRadius:'16px'}}/><a href={video} download style={{marginTop:'12px', color:'#0ff'}}>⬇️ Download Video</a></>}
      </div>
    </div>
  )
}
