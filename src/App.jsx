import { useState } from 'react'
import { fal } from "@fal-ai/client"

export default function App(){
  const [prompt,setPrompt]=useState("cinematic drone shot of Charminar Hyderabad at sunset")
  const [video,setVideo]=useState("")
  const [load,setLoad]=useState(false)

  const gen=async()=>{
    const KEY = import.meta.env.VITE_FAL_KEY
    if(!KEY){ alert("KEY missing! Vercel lo add chey bro"); return }
    if(!prompt){ alert("Prompt rayi"); return }
    fal.config({ credentials: KEY })
    setLoad(true)
    setVideo("")
    try{
      const result = await fal.subscribe("fal-ai/ltx-2/text-to-video", {
        input: { prompt: prompt, duration: "6", resolution: "1080p" },
        logs: true,
        onQueueUpdate: (u) => { if(u.status==="IN_PROGRESS") console.log(u.logs) }
      })
      console.log(result.data)
      setVideo(result.data.video.url)
    }catch(e){
      console.error(e)
      alert("ERROR: " + (e.message || JSON.stringify(e).slice(0,600)))
    }
    setLoad(false)
  }

  return(
    <div style={{padding:30, background:'#0a0a0a', color:'white', minHeight:'100vh', fontFamily:'sans-serif'}}>
      <h2>🎬 Pavan AI Generator ✅</h2>
      <p>Key: {import.meta.env.VITE_FAL_KEY? "✅ Ready" : "❌ Missing"}</p>
      <input value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="drone shot" style={{width:'360px', padding:'12px', borderRadius:'8px'}}/>
      <button onClick={gen} style={{padding:'12px 20px', marginLeft:'10px', borderRadius:'8px'}}>{load? "Generating 30s..." : "Generate"}</button>
      {video && <div style={{marginTop:20}}><video src={video} controls autoPlay loop style={{width:'100%', maxWidth:'600px', borderRadius:'12px'}}/><br/><a href={video} target="_blank" style={{color:'#0ff'}}>Download Video</a></div>}
    </div>
  )
}
